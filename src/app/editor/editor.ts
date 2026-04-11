import { graphemes } from "@lib/graphemes";
import { Key } from "@lib/kitty";
import { TextBuf } from "@lib/text-buf";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { Cursor } from "./cursor.ts";
import * as keys from "./handlers/mod.ts";
import { History } from "./history.ts";
import { CharColor, TextEditor } from "./text-editor.ts";
import { TextLayout } from "./text-layout.ts";

interface EditorProps {
  disabled: boolean; // TODO: rename to `focused`
  index: boolean;
  multiLine: boolean;
  whitespace: boolean;
  wrap: boolean;
  onCursorChange?: (_: { ln: number; col: number; lnCount: number }) => void;
  onKeyHandle?: (_: number) => void;
}

export class Editor extends ui.Frame {
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
  #clipboard = "";

  protected override children: {
    bg: ui.Bg;
    text: TextEditor;
  };

  constructor(readonly props: EditorProps) {
    super();

    this.children = {
      bg: new ui.Bg(),
      text: new TextEditor({
        disabled: props.disabled,
        index: props.index,
        whitespace: props.whitespace,
        wrap: props.wrap,
        textBuf: this.textBuf,
        textLayout: this.#textLayout,
        cursor: this.cursor,
        color: {
          bg: new Uint8Array(),
          void: new Uint8Array(),
          index: new Uint8Array(),
          char: {
            [CharColor.Undefined]: new Uint8Array(),
            [CharColor.Visible]: new Uint8Array(),
            [CharColor.Whitespace]: new Uint8Array(),
            [CharColor.Empty]: new Uint8Array(),
            [CharColor.VisibleSelected]: new Uint8Array(),
            [CharColor.WhitespaceSelected]: new Uint8Array(),
            [CharColor.EmptySelected]: new Uint8Array(),
          },
        },
      }),
    };
  }

  override resizeChildren(): void {
    const { bg, text } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    const { bg, text } = this.children;

    vt.buf.write(vt.cursor.save);

    bg.render();
    text.render();

    if (this.props.disabled) {
      vt.buf.write(vt.cursor.restore);
    }
  }

  reset(reset_cursor: boolean): void {
    if (reset_cursor) {
      if (this.props.multiLine) {
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

  onKey(key: Key): void {
    if (this.props.disabled) {
      return;
    }

    const t0 = performance.now();

    this.#handlers.find((x) => x.match(key))?.handle(key);

    this.props.onKeyHandle?.(performance.now() - t0);
  }

  setTheme(theme: themes.Theme): void {
    const { bg, text } = this.children;

    bg.color = new Uint8Array(theme.bg_main);

    text.props.color.bg = new Uint8Array(theme.bg_main);
    text.props.color.void = new Uint8Array(theme.bg_dark0);
    text.props.color.index = new Uint8Array([
      ...theme.bg_light0,
      ...theme.fg_dark0,
    ]);
    text.props.color.char = {
      [CharColor.Undefined]: new Uint8Array(),
      [CharColor.Visible]: new Uint8Array([
        ...theme.bg_main,
        ...theme.fg_light1,
      ]),
      [CharColor.Whitespace]: new Uint8Array([
        ...theme.bg_main,
        ...theme.fg_dark0,
      ]),
      [CharColor.Empty]: new Uint8Array([...theme.bg_main, ...theme.fg_main]),
      [CharColor.VisibleSelected]: new Uint8Array([
        ...theme.bg_light2,
        ...theme.fg_light1,
      ]),
      [CharColor.WhitespaceSelected]: new Uint8Array([
        ...theme.bg_light2,
        ...theme.fg_dark1,
      ]),
      [CharColor.EmptySelected]: new Uint8Array([
        ...theme.bg_light2,
        ...theme.fg_dark1,
      ]),
    };
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
    this.cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);
    return true;
  }
}
