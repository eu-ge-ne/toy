import { Command } from "@lib/commands";
import { graphemes, segmenter } from "@lib/graphemes";
import { Key } from "@lib/kitty";
import { range, sum } from "@lib/std";
import { TextBuf } from "@lib/text-buf";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { CharColor, charColor, colors } from "./colors.ts";
import { Cursor } from "./cursor.ts";
import * as keys from "./handlers/mod.ts";
import { History } from "./history.ts";
import { TextLayout } from "./text-layout.ts";

interface EditorEvents {
  cursorChanged: {
    ln: number;
    col: number;
    lnCount: number;
  };
  inputHandled: number;
}

interface EditorState {
  disabled: boolean;
  index: boolean;
  multiLine: boolean;
}

export class Editor extends ui.Component<EditorEvents> {
  #colors = colors(DefaultTheme);

  #handlers: keys.EditorHandler[] = [
    new keys.TextHandler(this),
    new keys.BackspaceHandler(this),
    new keys.BottomHandler(this),
    new keys.CopyHandler(this),
    new keys.CutHandler(this),
    new keys.DeleteHandler(this),
    new keys.DownHandler(this),
    new keys.EndHandler(this),
    new keys.EnterHandler(this),
    new keys.HomeHandler(this),
    new keys.LeftHandler(this),
    new keys.PageDownHandler(this),
    new keys.PageUpHandler(this),
    new keys.PasteHandler(this),
    new keys.RedoHandler(this),
    new keys.RightHandler(this),
    new keys.SelectAllHandler(this),
    new keys.TabHandler(this),
    new keys.TopHandler(this),
    new keys.UndoHandler(this),
    new keys.UpHandler(this),
  ];

  readonly textBuf = new TextBuf();
  readonly #textLayout = new TextLayout(this.textBuf);
  readonly cursor = new Cursor(this.textBuf, this.#textLayout);
  readonly history = new History(this.textBuf, this.cursor);

  #whitespaceEnabled = false;
  #wrapEnabled = false;
  #clipboard = "";

  protected override children: {
    bg: ui.Bg;
  };

  constructor(readonly state: EditorState) {
    super();

    this.children = {
      bg: new ui.Bg(this.#colors.background),
    };
  }

  reset(reset_cursor: boolean): void {
    if (reset_cursor) {
      if (this.state.multiLine) {
        this.cursor.set(0, 0, false);
      } else {
        this.cursor.set(
          Number.MAX_SAFE_INTEGER,
          Number.MAX_SAFE_INTEGER,
          false,
        );
      }
    }

    this.history.reset();
  }

  override handleKey(key: Key): boolean {
    if (this.state.disabled) {
      return false;
    }

    const t0 = performance.now();

    const h = this.#handlers.find((x) => x.match(key));
    if (!h) {
      return false;
    }

    h.handle(key);

    this.emit("inputHandled", performance.now() - t0);

    return true;
  }

  override async handleCommand(cmd: Command): Promise<void> {
    if (this.state.disabled) {
      return;
    }

    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.children.bg.color = this.#colors.background;
        break;

      case "Whitespace":
        this.#whitespaceEnabled = !this.#whitespaceEnabled;
        break;

      case "Wrap":
        this.#wrapEnabled = !this.#wrapEnabled;
        this.cursor.home(false);
        break;

      case "Copy":
        this.copy();
        break;

      case "Cut":
        this.cut();
        break;

      case "Paste":
        this.paste();
        break;

      case "Undo":
        this.undo();
        break;

      case "Redo":
        this.redo();
        break;

      case "SelectAll":
        this.selectAll();
        break;
    }
  }

  #sgr = new Intl.Segmenter();

  insert(text: string): void {
    const { history } = this;

    if (this.cursor.selecting) {
      this.#textLayout.delete(this.cursor.from, {
        ln: this.cursor.to.ln,
        col: this.cursor.to.col + 1,
      });

      this.cursor.set(this.cursor.from.ln, this.cursor.from.col, false);
    }

    this.#textLayout.insert(this.cursor, text);

    const grms = [...this.#sgr.segment(text)].map((x) =>
      graphemes.get(x.segment)
    );
    const eol_count = grms.filter((x) => x.isEol).length;

    if (eol_count === 0) {
      this.cursor.forward(grms.length);
    } else {
      const col = grms.length - grms.findLastIndex((x) => x.isEol) - 1;
      this.cursor.set(this.cursor.ln + eol_count, col, false);
    }

    history.push();
  }

  backspace(): void {
    const { history } = this;

    if (this.cursor.ln > 0 && this.cursor.col === 0) {
      const len = this.#textLayout.line(this.cursor.ln).take(2).reduce(
        (a) => a + 1,
        0,
      );
      if (len === 1) {
        this.#textLayout.delete(this.cursor, {
          ln: this.cursor.ln,
          col: this.cursor.col + 1,
        });
        this.cursor.left(false);
      } else {
        this.cursor.left(false);
        this.#textLayout.delete(this.cursor, {
          ln: this.cursor.ln,
          col: this.cursor.col + 1,
        });
      }
    } else {
      this.#textLayout.delete(
        { ln: this.cursor.ln, col: this.cursor.col - 1 },
        this.cursor,
      );
      this.cursor.left(false);
    }

    history.push();
  }

  deleteChar(): void {
    const { history } = this;

    this.#textLayout.delete(this.cursor, {
      ln: this.cursor.ln,
      col: this.cursor.col + 1,
    });

    history.push();
  }

  deleteSelection(): void {
    const { history } = this;

    this.#textLayout.delete(this.cursor.from, {
      ln: this.cursor.to.ln,
      col: this.cursor.to.col + 1,
    });
    this.cursor.set(this.cursor.from.ln, this.cursor.from.col, false);

    history.push();
  }

  copy(): boolean {
    if (this.cursor.selecting) {
      this.#clipboard = this.#textLayout.read(this.cursor.from, {
        ln: this.cursor.to.ln,
        col: this.cursor.to.col + 1,
      });

      this.cursor.set(this.cursor.ln, this.cursor.col, false);
    } else {
      this.#clipboard = this.#textLayout.read(this.cursor, {
        ln: this.cursor.ln,
        col: this.cursor.col + 1,
      });
    }

    vt.copy_to_clipboard(vt.sync, this.#clipboard);

    return false;
  }

  cut(): boolean {
    if (this.cursor.selecting) {
      this.#clipboard = this.#textLayout.read(this.cursor.from, {
        ln: this.cursor.to.ln,
        col: this.cursor.to.col + 1,
      });

      this.deleteSelection();
    } else {
      this.#clipboard = this.#textLayout.read(this.cursor, {
        ln: this.cursor.ln,
        col: this.cursor.col + 1,
      });

      this.deleteChar();
    }

    vt.copy_to_clipboard(vt.sync, this.#clipboard);

    return true;
  }

  paste(): boolean {
    if (!this.#clipboard) {
      return false;
    }

    this.insert(this.#clipboard);

    return true;
  }

  undo(): boolean {
    return this.history.undo();
  }

  redo(): boolean {
    return this.history.redo();
  }

  selectAll(): boolean {
    this.cursor.set(0, 0, false);
    this.cursor.set(
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      true,
    );
    return true;
  }

  private index_width = 0;
  private text_width = 0;
  private cursor_y = 0;
  private cursor_x = 0;
  private scroll_ln = 0;
  private scroll_col = 0;

  override resizeChildren(): void {
    this.children.bg.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    vt.buf.write(vt.cursor.save);
    this.children.bg.render();

    if (this.state.index && (this.textBuf.lineCount > 0)) {
      this.index_width = Math.trunc(Math.log10(this.textBuf.lineCount)) + 3;
    } else {
      this.index_width = 0;
    }

    this.text_width = this.width - this.index_width;
    segmenter.settings.width = this.#wrapEnabled
      ? this.text_width
      : Number.MAX_SAFE_INTEGER;

    segmenter.settings.y = this.cursor_y = this.y;
    segmenter.settings.x = this.cursor_x = this.x + this.index_width;

    if (this.width >= this.index_width) {
      this.#renderLines();
    }

    if (!this.state.disabled) {
      vt.cursor.set(vt.buf, this.cursor_y, this.cursor_x);
    } else {
      vt.buf.write(vt.cursor.restore);
    }
  }

  #renderLines(): void {
    this.#scrollV();
    this.#scrollH();

    let row = this.y;

    for (let ln = this.scroll_ln;; ln += 1) {
      if (ln < this.textBuf.lineCount) {
        row = this.#renderLine(ln, row);
      } else {
        vt.cursor.set(vt.buf, row, this.x);
        vt.buf.write(this.#colors.void);
        vt.clear_line(vt.buf, this.width);
      }

      row += 1;
      if (row >= this.y + this.height) {
        break;
      }
    }
  }

  #renderLine(ln: number, row: number): number {
    let available_w = 0;
    let current_color = CharColor.Undefined;

    const xs = this.#textLayout.line(ln);

    for (const { gr: { width, isVisible, bytes }, i, col } of xs) {
      if (col === 0) {
        if (i > 0) {
          row += 1;
          if (row >= this.y + this.height) {
            return row;
          }
        }

        vt.cursor.set(vt.buf, row, this.x);

        if (this.index_width > 0) {
          if (i === 0) {
            vt.buf.write(this.#colors.index);
            vt.write_text(
              vt.buf,
              [this.index_width],
              `${ln + 1} `.padStart(this.index_width),
            );
          } else {
            vt.buf.write(this.#colors.background);
            vt.write_spaces(vt.buf, this.index_width);
          }
        }

        available_w = this.width - this.index_width;
      }

      if ((col < this.scroll_col) || (width > available_w)) {
        continue;
      }

      const color = charColor(
        this.cursor.isSelected(ln, i),
        isVisible,
        this.#whitespaceEnabled,
      );

      if (color !== current_color) {
        current_color = color;
        vt.buf.write(this.#colors.char[color]);
      }

      vt.buf.write(bytes);

      available_w -= width;
    }

    return row;
  }

  #scrollV(): void {
    const delta_ln = this.cursor.ln - this.scroll_ln;

    // Above?
    if (delta_ln <= 0) {
      this.scroll_ln = this.cursor.ln;
      return;
    }

    // Below?

    if (delta_ln > this.height) {
      this.scroll_ln = this.cursor.ln - this.height;
    }

    const xs = range(this.scroll_ln, this.cursor.ln + 1).map((ln) =>
      this.#textLayout.line(ln)
        .reduce((a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0), 1)
    );

    let i = 0;
    let height = sum(xs);

    while (height > this.height) {
      height -= xs[i]!;
      this.scroll_ln += 1;
      i += 1;
    }

    while (i < xs.length - 1) {
      this.cursor_y += xs[i]!;
      i += 1;
    }
  }

  #scrollH(): void {
    const cell =
      this.#textLayout.line(this.cursor.ln, true).drop(this.cursor.col).next()
        .value;
    if (cell) {
      this.cursor_y += cell.ln;
    }

    const col = cell?.col ?? 0; // col = f(cursor.col)
    const delta_col = col - this.scroll_col;

    // Before?
    if (delta_col <= 0) {
      this.scroll_col = col;
      return;
    }

    // After?

    const xs = this.#textLayout.line(this.cursor.ln, true)
      .drop(this.cursor.col - delta_col)
      .take(delta_col)
      .map((x) => x.gr.width)
      .toArray();

    let width = sum(xs);

    for (const w of xs) {
      if (width < this.text_width) {
        break;
      }

      this.scroll_col += 1;
      width -= w;
    }

    this.cursor_x += width;
  }

  enable(x: boolean): void {
    this.state.disabled = !x;
  }
}
