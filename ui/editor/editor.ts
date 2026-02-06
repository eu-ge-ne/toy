import { Command } from "@lib/commands";
import { Cursor } from "@lib/cursor";
import { graphemes } from "@lib/grapheme";
import { History } from "@lib/history";
import { Key } from "@lib/kitty";
import { SegBuf } from "@lib/seg-buf";
import { range, sum } from "@lib/std";
import { Themes } from "@lib/themes";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";
import * as keys from "./handlers/mod.ts";

interface EditorOptions {
  multi_line: boolean;
}

export class Editor extends Control {
  #zen = true;

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

  on_input_handled?: (_: number) => void;
  on_render?: (_: number) => void;
  on_cursor?: (_: { ln: number; col: number; ln_count: number }) => void;

  readonly buffer = new SegBuf();
  readonly cursor = new Cursor(this.buffer);
  readonly history = new History(this.buffer, this.cursor);

  index_enabled = false;
  whitespace_enabled = false;
  wrap_enabled = false;
  clipboard = "";

  constructor(parent: Control, readonly opts: EditorOptions) {
    super(parent);
  }

  layout({ y, x, w, h }: Area): void {
    if (this.#zen) {
      this.y = y;
      this.x = x;
      this.w = w;
      this.h = h;
    } else {
      this.y = y + 1;
      this.x = x;
      this.w = w;
      this.h = h - 2;
    }
  }

  reset(reset_cursor: boolean): void {
    if (reset_cursor) {
      if (this.opts.multi_line) {
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

  handleKey(key: Key): boolean {
    if (!this.enabled) {
      return false;
    }

    const t0 = performance.now();

    const handler = this.#handlers.find((x) => x.match(key));
    const r = handler?.handle(key) ?? false;

    const t1 = performance.now();
    this.on_input_handled?.(t1 - t0);

    return r;
  }

  async handleCommand(command: Command): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    switch (command.name) {
      case "Theme":
        colors.setEditorColors(Themes[command.data]);
        return true;

      case "Zen":
        this.#setZen();
        return true;

      case "Whitespace":
        this.whitespace_enabled = !this.whitespace_enabled;
        return true;

      case "Wrap":
        this.wrap_enabled = !this.wrap_enabled;
        this.cursor.home(false);
        return true;
      case "Copy":
        return this.copy();
      case "Cut":
        return this.cut();
      case "Paste":
        return this.paste();
      case "Undo":
        return this.undo();
      case "Redo":
        return this.redo();
      case "SelectAll":
        return this.selectAll();
    }

    return false;
  }

  #sgr = new Intl.Segmenter();

  insert(text: string): void {
    const { cursor, buffer, history } = this;

    if (cursor.selecting) {
      buffer.delete(cursor.from, {
        ln: cursor.to.ln,
        col: cursor.to.col + 1,
      });

      cursor.set(cursor.from.ln, cursor.from.col, false);
    }

    buffer.insert(cursor, text);

    const grms = [...this.#sgr.segment(text)].map((x) =>
      graphemes.get(x.segment)
    );
    const eol_count = grms.filter((x) => x.is_eol).length;

    if (eol_count === 0) {
      cursor.forward(grms.length);
    } else {
      const col = grms.length - grms.findLastIndex((x) => x.is_eol) - 1;
      cursor.set(cursor.ln + eol_count, col, false);
    }

    history.push();
  }

  backspace(): void {
    const { cursor, buffer, history } = this;

    if (cursor.ln > 0 && cursor.col === 0) {
      const len = buffer.line(cursor.ln).take(2).reduce((a) => a + 1, 0);
      if (len === 1) {
        buffer.delete(cursor, { ln: cursor.ln, col: cursor.col + 1 });
        cursor.left(false);
      } else {
        cursor.left(false);
        buffer.delete(cursor, { ln: cursor.ln, col: cursor.col + 1 });
      }
    } else {
      buffer.delete({ ln: cursor.ln, col: cursor.col - 1 }, cursor);
      cursor.left(false);
    }

    history.push();
  }

  delete_char(): void {
    const { cursor, buffer, history } = this;

    buffer.delete(cursor, { ln: cursor.ln, col: cursor.col + 1 });

    history.push();
  }

  delete_selection(): void {
    const { cursor, buffer, history } = this;

    buffer.delete(cursor.from, {
      ln: cursor.to.ln,
      col: cursor.to.col + 1,
    });
    cursor.set(cursor.from.ln, cursor.from.col, false);

    history.push();
  }

  copy(): boolean {
    const { cursor, buffer } = this;

    if (cursor.selecting) {
      this.clipboard = buffer.read(cursor.from, {
        ln: cursor.to.ln,
        col: cursor.to.col + 1,
      });

      cursor.set(cursor.ln, cursor.col, false);
    } else {
      this.clipboard = buffer.read(cursor, {
        ln: cursor.ln,
        col: cursor.col + 1,
      });
    }

    vt.copy_to_clipboard(vt.sync, this.clipboard);

    return false;
  }

  cut(): boolean {
    const { cursor, buffer } = this;

    if (cursor.selecting) {
      this.clipboard = buffer.read(cursor.from, {
        ln: cursor.to.ln,
        col: cursor.to.col + 1,
      });

      this.delete_selection();
    } else {
      this.clipboard = buffer.read(cursor, {
        ln: cursor.ln,
        col: cursor.col + 1,
      });

      this.delete_char();
    }

    vt.copy_to_clipboard(vt.sync, this.clipboard);

    return true;
  }

  paste(): boolean {
    if (!this.clipboard) {
      return false;
    }

    this.insert(this.clipboard);

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

  render(): void {
    const t0 = performance.now();

    const {
      y,
      x,
      w,
      enabled,
      wrap_enabled,
      index_enabled,
      buffer: { line_count },
    } = this;

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(colors.BACKGROUND);
    vt.clear_area(vt.buf, this);

    if (index_enabled && (line_count > 0)) {
      this.index_width = Math.trunc(Math.log10(line_count)) + 3;
    } else {
      this.index_width = 0;
    }

    this.text_width = w - this.index_width;
    this.buffer.wrap_width = wrap_enabled
      ? this.text_width
      : Number.MAX_SAFE_INTEGER;

    this.buffer.measure_y = this.cursor_y = y;
    this.buffer.measure_x = this.cursor_x = x + this.index_width;

    if (w >= this.index_width) {
      this.#render_lines();
    }

    if (enabled) {
      vt.cursor.set(vt.buf, this.cursor_y, this.cursor_x);
    } else {
      vt.buf.write(vt.cursor.restore);
    }
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();

    this.on_cursor?.({ ...this.cursor, ln_count: this.buffer.line_count });

    const t1 = performance.now();
    this.on_render?.(t1 - t0);
  }

  #render_lines(): void {
    const { y, x, w, h, buffer: { line_count } } = this;

    this.#scroll_v();
    this.#scroll_h();

    let row = y;

    for (let ln = this.scroll_ln;; ln += 1) {
      if (ln < line_count) {
        row = this.#render_line(ln, row);
      } else {
        vt.cursor.set(vt.buf, row, x);
        vt.buf.write(colors.VOID);
        vt.clear_line(vt.buf, w);
      }

      row += 1;
      if (row >= y + h) {
        break;
      }
    }
  }

  #render_line(ln: number, row: number): number {
    const { y, h, cursor, whitespace_enabled } = this;

    let available_w = 0;
    let current_color = colors.CharColor.Undefined;

    const xs = this.buffer.line(ln);

    for (const { g: { width, is_visible, bytes }, i, col } of xs) {
      if (col === 0) {
        if (i > 0) {
          row += 1;
          if (row >= y + h) {
            return row;
          }
        }

        vt.cursor.set(vt.buf, row, this.x);

        if (this.index_width > 0) {
          if (i === 0) {
            vt.buf.write(colors.INDEX);
            vt.write_text(
              vt.buf,
              [this.index_width],
              `${ln + 1} `.padStart(this.index_width),
            );
          } else {
            vt.buf.write(colors.BACKGROUND);
            vt.write_spaces(vt.buf, this.index_width);
          }
        }

        available_w = this.w - this.index_width;
      }

      if ((col < this.scroll_col) || (width > available_w)) {
        continue;
      }

      const color = colors.create_char_color(
        cursor.is_selected(ln, i),
        is_visible,
        whitespace_enabled,
      );

      if (color !== current_color) {
        current_color = color;
        vt.buf.write(colors.CHAR[color]);
      }

      vt.buf.write(bytes);

      available_w -= width;
    }

    return row;
  }

  #scroll_v(): void {
    const { cursor, h } = this;

    const delta_ln = cursor.ln - this.scroll_ln;

    // Above?
    if (delta_ln <= 0) {
      this.scroll_ln = cursor.ln;
      return;
    }

    // Below?

    if (delta_ln > h) {
      this.scroll_ln = cursor.ln - h;
    }

    const xs = range(this.scroll_ln, cursor.ln + 1).map((ln) =>
      this.buffer.line(ln)
        .reduce((a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0), 1)
    );

    let i = 0;
    let height = sum(xs);

    while (height > h) {
      height -= xs[i]!;
      this.scroll_ln += 1;
      i += 1;
    }

    while (i < xs.length - 1) {
      this.cursor_y += xs[i]!;
      i += 1;
    }
  }

  #scroll_h(): void {
    const { cursor } = this;

    const cell =
      this.buffer.line(cursor.ln, true).drop(cursor.col).next().value;
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

    const xs = this.buffer.line(cursor.ln, true)
      .drop(cursor.col - delta_col)
      .take(delta_col)
      .map((x) => x.g.width)
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

  #setZen(x?: boolean): void {
    if (typeof x === "undefined") {
      x = !this.#zen;
    }
    this.#zen = x;
    this.index_enabled = !x;
  }
}
