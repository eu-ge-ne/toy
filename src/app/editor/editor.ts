import { graphemes } from "@lib/graphemes";
import * as kitty from "@lib/kitty";
import { TextBuf } from "@lib/text-buf";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { Cursor } from "./cursor.ts";
import { History } from "./history.ts";
import { TextEditor } from "./text-editor.ts";
import { TextLayout } from "./text-layout.ts";

interface EditorParams {
  readonly multiLine: boolean;
  readonly onCursorChange?: (
    _: { ln: number; col: number; lnCount: number },
  ) => void;
  readonly onKeyHandle?: (_: number) => void;
}

export class Editor extends ui.Frame {
  #focused = false;

  readonly textBuf = new TextBuf();
  readonly #textLayout = new TextLayout(this.textBuf);
  readonly cursor = new Cursor(this.textBuf, this.#textLayout);
  readonly history = new History(this.textBuf, this.cursor);
  #clipboard = "";

  protected override children: {
    bg: ui.Bg;
    text: TextEditor;
  };

  constructor(readonly params: EditorParams) {
    super();

    this.children = {
      bg: new ui.Bg(),
      text: new TextEditor(this.cursor, this.textBuf, this.#textLayout),
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

    if (!this.#focused) {
      vt.buf.write(vt.cursor.restore);
    }
  }

  setTheme(theme: themes.Theme): void {
    this.children.bg.color = new Uint8Array(theme.bg_main);
    this.children.text.setTheme(theme);
  }

  setFocused(x: boolean): void {
    this.#focused = x;
    this.children.text.setFocused(x);
  }

  toggleWrapped(): void {
    if (!this.#focused) {
      return;
    }
    this.children.text.toggleWrapped();
    this.cursor.home(false);
  }

  toggleWhitespace(): void {
    if (!this.#focused) {
      return;
    }
    this.children.text.toggleWhitespace();
  }

  toggleIndex(): void {
    if (!this.#focused) {
      return;
    }
    this.children.text.toggleIndex();
  }

  reset(resetCursor: boolean): void {
    if (resetCursor) {
      if (this.params.multiLine) {
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

  onKey(key: kitty.Key): void {
    if (!this.#focused) {
      return;
    }

    const t0 = performance.now();

    this.#handlers.find((x) => x.match(key))?.handle.call(this, key);

    this.params.onKeyHandle?.(performance.now() - t0);
  }

  #handlers: {
    match: (_: kitty.Key) => boolean;
    handle: (_: kitty.Key) => boolean;
  }[] = [
    {
      match: (x) => typeof x.text === "string",
      handle: this.onKeyText,
    },
    {
      match: (x) => x.name === "BACKSPACE",
      handle: this.onKeyBackspace,
    },
    {
      match: (x) => x.name === "DOWN" && Boolean(x.super),
      handle: this.onKeyBottom,
    },
    {
      match: (x) => x.name === "c" && Boolean(x.ctrl || x.super),
      handle: this.onKeyCopy,
    },
    {
      match: (x) => x.name === "x" && Boolean(x.ctrl || x.super),
      handle: this.onKeyCut,
    },
    {
      match: (x) => x.name === "DELETE",
      handle: this.onKeyDelete,
    },
    {
      match: (x) => x.name === "DOWN",
      handle: this.onKeyDown,
    },
    {
      match: (x) => {
        if (x.name === "END") {
          return true;
        }
        if (x.name === "RIGHT" && x.super) {
          return true;
        }
        return false;
      },
      handle: this.onKeyEnd,
    },
    {
      match: (x) => x.name === "ENTER",
      handle: this.onKeyEnter,
    },
    {
      match: (x) => {
        if (x.name === "HOME") {
          return true;
        }
        if (x.name === "LEFT" && x.super) {
          return true;
        }
        return false;
      },
      handle: this.onKeyHome,
    },
    {
      match: (x) => x.name === "LEFT",
      handle: this.onKeyLeft,
    },
    {
      match: (x) => x.name === "PAGE_DOWN",
      handle: this.onKeyPageDown,
    },
    {
      match: (x) => x.name === "PAGE_UP",
      handle: this.onKeyPageUp,
    },
    {
      match: (x) => x.name === "v" && Boolean(x.ctrl || x.super),
      handle: this.onKeyPaste,
    },
    {
      match: (x) => x.name === "y" && Boolean(x.ctrl || x.super),
      handle: this.onKeyRedo,
    },
    {
      match: (x) => x.name === "RIGHT",
      handle: this.onKeyRight,
    },
    {
      match: (x) => x.name === "a" && Boolean(x.ctrl || x.super),
      handle: this.onKeySelectAll,
    },
    {
      match: (x) => x.name === "TAB",
      handle: this.onKeyTab,
    },
    {
      match: (x) => x.name === "UP" && Boolean(x.super),
      handle: this.onKeyTop,
    },
    {
      match: (x) => x.name === "z" && Boolean(x.ctrl || x.super),
      handle: this.onKeyUndo,
    },
    {
      match: (x) => x.name === "UP",
      handle: this.onKeyUp,
    },
  ];

  onKeyText(key: kitty.Key): boolean {
    this.insert(key.text!);
    return true;
  }

  onKeyBackspace(): boolean {
    if (this.cursor.selecting) {
      this.deleteSelection();
    } else {
      this.backspace();
    }
    return true;
  }

  onKeyBottom(key: kitty.Key): boolean {
    if (!this.params.multiLine) {
      return false;
    }
    return this.cursor.bottom(Boolean(key.shift));
  }

  onKeyCopy(): boolean {
    return this.copy();
  }

  onKeyCut(): boolean {
    return this.cut();
  }

  onKeyDelete(): boolean {
    if (this.cursor.selecting) {
      this.deleteSelection();
    } else {
      this.deleteChar();
    }
    return true;
  }

  onKeyDown(key: kitty.Key): boolean {
    if (!this.params.multiLine) {
      return false;
    }
    return this.cursor.down(1, Boolean(key.shift));
  }

  onKeyEnd(key: kitty.Key): boolean {
    return this.cursor.end(Boolean(key.shift));
  }

  onKeyEnter(): boolean {
    if (!this.params.multiLine) {
      return false;
    }
    this.insert("\n");
    return true;
  }

  onKeyHome(key: kitty.Key): boolean {
    return this.cursor.home(Boolean(key.shift));
  }

  onKeyLeft(key: kitty.Key): boolean {
    return this.cursor.left(Boolean(key.shift));
  }

  onKeyPageDown(key: kitty.Key): boolean {
    if (!this.params.multiLine) {
      return false;
    }
    return this.cursor.down(this.height, Boolean(key.shift));
  }

  onKeyPageUp(key: kitty.Key): boolean {
    if (!this.params.multiLine) {
      return false;
    }
    return this.cursor.up(this.height, Boolean(key.shift));
  }

  onKeyPaste(): boolean {
    return this.paste();
  }

  onKeyRedo(): boolean {
    return this.redo();
  }

  onKeyRight(key: kitty.Key): boolean {
    return this.cursor.right(Boolean(key.shift));
  }

  onKeySelectAll(): boolean {
    return this.selectAll();
  }

  onKeyTab(): boolean {
    if (this.params.multiLine) {
      this.insert("\t");
      return true;
    }
    return false;
  }

  onKeyTop(key: kitty.Key): boolean {
    if (!this.params.multiLine) {
      return false;
    }
    return this.cursor.top(Boolean(key.shift));
  }

  onKeyUndo(): boolean {
    return this.undo();
  }

  onKeyUp(key: kitty.Key): boolean {
    if (!this.params.multiLine) {
      return false;
    }
    return this.cursor.up(1, Boolean(key.shift));
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
    if (!this.#focused) {
      return false;
    }

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
    if (!this.#focused) {
      return false;
    }

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
    if (!this.#focused) {
      return false;
    }

    if (!this.#clipboard) {
      return false;
    }

    this.insert(this.#clipboard);

    return true;
  }

  undo(): boolean {
    if (!this.#focused) {
      return false;
    }

    return this.history.undo();
  }

  redo(): boolean {
    if (!this.#focused) {
      return false;
    }

    return this.history.redo();
  }

  selectAll(): boolean {
    if (!this.#focused) {
      return false;
    }

    this.cursor.set(0, 0, false);
    this.cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);

    return true;
  }
}
