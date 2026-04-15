import * as document from "@lib/document";
import * as graphemes from "@lib/graphemes";
import * as kitty from "@lib/kitty";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { Content } from "./content.ts";
import { Cursor } from "./cursor.ts";
import { History } from "./history.ts";

interface EditorParams {
  readonly multiLine: boolean;
  readonly onTextChange?: () => void;
  readonly onCursorChange?: (
    _: { ln: number; col: number; lnCount: number },
  ) => void;
  readonly onKeyHandle?: (_: number) => void;
}

export class Editor extends ui.Frame {
  #focused = false;

  readonly #doc = new document.Document();
  readonly #gDoc = new graphemes.Document(this.#doc);
  readonly #cursor = new Cursor(this.#doc, this.#gDoc);
  readonly #history = new History(this.#doc, this.#cursor);
  #clipboard = "";

  get textChanged(): boolean {
    return this.#history.changed;
  }

  get text(): string {
    return this.#doc.text;
  }

  set text(x: string) {
    this.#doc.text = x;
  }

  protected override children: {
    bg: ui.Bg;
    content: Content;
  };

  constructor(readonly params: EditorParams) {
    super();

    this.children = {
      bg: new ui.Bg(),
      content: new Content(this.#doc, this.#gDoc, this.#cursor),
    };

    this.#history.onChange = params.onTextChange;

    this.#cursor.onChange = () =>
      params.onCursorChange?.({
        ln: this.#cursor.ln,
        col: this.#cursor.col,
        lnCount: this.#doc.lineCount,
      });
  }

  override resizeChildren(): void {
    const { bg, content } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    content.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    const { bg, content } = this.children;

    vt.buf.write(vt.cursor.save);

    bg.render();
    content.render();

    if (!this.#focused) {
      vt.buf.write(vt.cursor.restore);
    }
  }

  read(): Generator<string> {
    return this.#doc.read(0);
  }

  append(text: string): void {
    this.#doc.append(text);
  }

  setTheme(theme: themes.Theme): void {
    const { bg, content } = this.children;

    bg.color = new Uint8Array(theme.bgMain);
    content.setTheme(theme);
  }

  setFocused(x: boolean): void {
    this.#focused = x;
    this.children.content.setFocused(x);
  }

  toggleWrapped(): void {
    if (!this.#focused) {
      return;
    }
    this.children.content.toggleWrapped();
    this.#cursor.home(false);
  }

  toggleWhitespace(): void {
    if (!this.#focused) {
      return;
    }
    this.children.content.toggleWhitespace();
  }

  toggleIndex(): void {
    if (!this.#focused) {
      return;
    }
    this.children.content.toggleIndex();
  }

  resetChanges(): void {
    this.#history.reset();
  }

  resetCursor(): void {
    if (this.params.multiLine) {
      this.#cursor.set(0, 0, false);
    } else {
      this.#cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, false);
    }
  }

  onKey(key: kitty.Key): void {
    if (!this.#focused) {
      return;
    }

    const t0 = performance.now();

    this.#onKeyHandlers.find(([_, match]) => match(key))?.[0].call(this, key);

    this.params.onKeyHandle?.(performance.now() - t0);
  }

  #onKeyHandlers: [(_: kitty.Key) => void, (_: kitty.Key) => boolean][] = [
    [
      this.#onKeyText,
      (x) => typeof x.text === "string",
    ],
    [
      this.#onKeyBackspace,
      (x) => x.name === "BACKSPACE",
    ],
    [
      this.#onKeyBottom,
      (x) => this.params.multiLine && x.name === "DOWN" && Boolean(x.super),
    ],
    [
      this.#onKeyCopy,
      (x) => x.name === "c" && Boolean(x.ctrl || x.super),
    ],
    [
      this.#onKeyCut,
      (x) => x.name === "x" && Boolean(x.ctrl || x.super),
    ],
    [
      this.#onKeyDelete,
      (x) => x.name === "DELETE",
    ],
    [
      this.#onKeyDown,
      (x) => this.params.multiLine && x.name === "DOWN",
    ],
    [
      this.#onKeyEnd,
      (x) => {
        if (x.name === "END") {
          return true;
        }
        if (x.name === "RIGHT" && x.super) {
          return true;
        }
        return false;
      },
    ],
    [
      this.#onKeyEnter,
      (x) => this.params.multiLine && x.name === "ENTER",
    ],
    [
      this.#onKeyHome,
      (x) => {
        if (x.name === "HOME") {
          return true;
        }
        if (x.name === "LEFT" && x.super) {
          return true;
        }
        return false;
      },
    ],
    [
      this.#onKeyLeft,
      (x) => x.name === "LEFT",
    ],
    [
      this.#onKeyPageDown,
      (x) => this.params.multiLine && x.name === "PAGE_DOWN",
    ],
    [
      this.#onKeyPageUp,
      (x) => this.params.multiLine && x.name === "PAGE_UP",
    ],
    [
      this.#onKeyPaste,
      (x) => x.name === "v" && Boolean(x.ctrl || x.super),
    ],
    [
      this.#onKeyRedo,
      (x) => x.name === "y" && Boolean(x.ctrl || x.super),
    ],
    [
      this.#onKeyRight,
      (x) => x.name === "RIGHT",
    ],
    [
      this.#onKeySelectAll,
      (x) => x.name === "a" && Boolean(x.ctrl || x.super),
    ],
    [
      this.#onKeyTab,
      (x) => x.name === "TAB",
    ],
    [
      this.#onKeyTop,
      (x) => this.params.multiLine && x.name === "UP" && Boolean(x.super),
    ],
    [
      this.#onKeyUndo,
      (x) => x.name === "z" && Boolean(x.ctrl || x.super),
    ],
    [
      this.#onKeyUp,
      (x) => this.params.multiLine && x.name === "UP",
    ],
  ];

  #onKeyText(key: kitty.Key): void {
    this.#insertText(key.text!);
  }

  #onKeyBackspace(): void {
    if (this.#cursor.selecting) {
      this.#deleteSelection();
    } else {
      this.#backspace();
    }
  }

  #onKeyBottom(key: kitty.Key): void {
    this.#cursor.bottom(Boolean(key.shift));
  }

  #onKeyCopy(): void {
    this.copy();
  }

  #onKeyCut(): void {
    this.cut();
  }

  #onKeyDelete(): void {
    if (this.#cursor.selecting) {
      this.#deleteSelection();
    } else {
      this.#deleteChar();
    }
  }

  #onKeyDown(key: kitty.Key): void {
    this.#cursor.down(1, Boolean(key.shift));
  }

  #onKeyEnd(key: kitty.Key): void {
    this.#cursor.end(Boolean(key.shift));
  }

  #onKeyEnter(): void {
    this.#insertText("\n");
  }

  #onKeyHome(key: kitty.Key): void {
    this.#cursor.home(Boolean(key.shift));
  }

  #onKeyLeft(key: kitty.Key): void {
    this.#cursor.left(Boolean(key.shift));
  }

  #onKeyPageDown(key: kitty.Key): void {
    this.#cursor.down(this.height, Boolean(key.shift));
  }

  #onKeyPageUp(key: kitty.Key): void {
    this.#cursor.up(this.height, Boolean(key.shift));
  }

  #onKeyPaste(): void {
    this.paste();
  }

  #onKeyRedo(): void {
    this.redo();
  }

  #onKeyRight(key: kitty.Key): void {
    this.#cursor.right(Boolean(key.shift));
  }

  #onKeySelectAll(): void {
    this.selectAll();
  }

  #onKeyTab(): void {
    this.#insertText("\t");
  }

  #onKeyTop(key: kitty.Key): void {
    this.#cursor.top(Boolean(key.shift));
  }

  #onKeyUndo(): void {
    this.undo();
  }

  #onKeyUp(key: kitty.Key): void {
    this.#cursor.up(1, Boolean(key.shift));
  }

  #sgr = new Intl.Segmenter();

  #insertText(text: string): void {
    if (this.#cursor.selecting) {
      this.#gDoc.delete(this.#cursor.from, {
        ln: this.#cursor.to.ln,
        col: this.#cursor.to.col + 1,
      });

      this.#cursor.set(this.#cursor.from.ln, this.#cursor.from.col, false);
    }

    this.#gDoc.insert(this.#cursor, text);

    const grms = [...this.#sgr.segment(text)].map((x) =>
      graphemes.graphemes.get(x.segment)
    );
    const eol_count = grms.filter((x) => x.isEol).length;

    if (eol_count === 0) {
      this.#cursor.forward(grms.length);
    } else {
      const col = grms.length - grms.findLastIndex((x) => x.isEol) - 1;
      this.#cursor.set(this.#cursor.ln + eol_count, col, false);
    }

    this.#history.push();
  }

  #backspace(): void {
    if (this.#cursor.ln > 0 && this.#cursor.col === 0) {
      const len = this.#gDoc.line(this.#cursor.ln).take(2)
        .reduce((a) => a + 1, 0);
      if (len === 1) {
        this.#gDoc.delete(this.#cursor, {
          ln: this.#cursor.ln,
          col: this.#cursor.col + 1,
        });
        this.#cursor.left(false);
      } else {
        this.#cursor.left(false);
        this.#gDoc.delete(this.#cursor, {
          ln: this.#cursor.ln,
          col: this.#cursor.col + 1,
        });
      }
    } else {
      this.#gDoc.delete({
        ln: this.#cursor.ln,
        col: this.#cursor.col - 1,
      }, this.#cursor);
      this.#cursor.left(false);
    }

    this.#history.push();
  }

  #deleteChar(): void {
    this.#gDoc.delete(this.#cursor, {
      ln: this.#cursor.ln,
      col: this.#cursor.col + 1,
    });

    this.#history.push();
  }

  #deleteSelection(): void {
    this.#gDoc.delete(this.#cursor.from, {
      ln: this.#cursor.to.ln,
      col: this.#cursor.to.col + 1,
    });
    this.#cursor.set(this.#cursor.from.ln, this.#cursor.from.col, false);

    this.#history.push();
  }

  copy(): void {
    if (!this.#focused) {
      return;
    }

    if (this.#cursor.selecting) {
      this.#clipboard = this.#gDoc.read(this.#cursor.from, {
        ln: this.#cursor.to.ln,
        col: this.#cursor.to.col + 1,
      });

      this.#cursor.set(this.#cursor.ln, this.#cursor.col, false);
    } else {
      this.#clipboard = this.#gDoc.read(this.#cursor, {
        ln: this.#cursor.ln,
        col: this.#cursor.col + 1,
      });
    }

    vt.copy_to_clipboard(vt.sync, this.#clipboard);

    return;
  }

  cut(): void {
    if (!this.#focused) {
      return;
    }

    if (this.#cursor.selecting) {
      this.#clipboard = this.#gDoc.read(this.#cursor.from, {
        ln: this.#cursor.to.ln,
        col: this.#cursor.to.col + 1,
      });

      this.#deleteSelection();
    } else {
      this.#clipboard = this.#gDoc.read(this.#cursor, {
        ln: this.#cursor.ln,
        col: this.#cursor.col + 1,
      });

      this.#deleteChar();
    }

    vt.copy_to_clipboard(vt.sync, this.#clipboard);

    return;
  }

  paste(): void {
    if (!this.#focused) {
      return;
    }

    if (!this.#clipboard) {
      return;
    }

    this.#insertText(this.#clipboard);
  }

  undo(): void {
    if (!this.#focused) {
      return;
    }

    this.#history.undo();
  }

  redo(): void {
    if (!this.#focused) {
      return;
    }
    this.#history.redo();
  }

  selectAll(): void {
    if (!this.#focused) {
      return;
    }

    this.#cursor.set(0, 0, false);
    this.#cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);
  }
}
