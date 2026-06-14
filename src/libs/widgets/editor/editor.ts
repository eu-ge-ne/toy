import * as buffers from "@libs/buffers";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";

import { Bg } from "../bg/bg.ts";
import { Widget } from "../widget.ts";
import { Content } from "./content.ts";
import { Cursor } from "./cursor.ts";

interface Params {
  multiLine: boolean;
  onCursorChange?: (_: { ln: number; col: number }) => void;
}

export class Editor extends Widget<Params> {
  readonly #cursor: Cursor;
  readonly #cursorHistory = new history.History<{ ln: number; col: number }>();
  #clipboard = "";

  constructor(private readonly buffer: buffers.Buffer, params: Params) {
    super(params);

    this.#cursor = new Cursor(buffer);
    this.#cursor.onChange = () =>
      params.onCursorChange?.({ ln: this.#cursor.ln, col: this.#cursor.col });

    this.children = {
      bg: new Bg(),
      content: new Content(buffer, this.#cursor),
    };

    this.#resetCursor();

    buffer.signals.on("edit")(() =>
      this.#cursorHistory.push({ ln: this.#cursor.ln, col: this.#cursor.col })
    );
    buffer.signals.on("undo")(() => {
      const entry = this.#cursorHistory.undo();
      if (entry) {
        this.#cursor.set(entry.ln, entry.col, false);
      }
    });
    buffer.signals.on("redo")(() => {
      const entry = this.#cursorHistory.redo();
      if (entry) {
        this.#cursor.set(entry.ln, entry.col, false);
      }
    });
    buffer.signals.on("reset.undo")(() => {
      this.#resetCursor();
    });
  }

  protected override children: {
    bg: Bg;
    content: Content;
  };

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
  }

  setTheme(theme: themes.Theme): void {
    const { bg, content } = this.children;

    bg.color = new Uint8Array(theme.bgMain);
    content.setTheme(theme);
  }

  toggleWrap(): void {
    this.children.content.toggleWrap();
    this.#cursor.home(false);
  }

  toggleWhitespace(): void {
    this.children.content.toggleWhitespace();
  }

  toggleIndex(): void {
    this.children.content.toggleIndex();
  }

  onKeyPress(key: kitty.Key): void {
    const handler = this.#onKeyHandlers.find(([_, match]) => match(key));
    if (!handler) {
      return;
    }

    handler[0].call(this, key);
  }

  #onKeyHandlers: [(_: kitty.Key) => void, (_: kitty.Key) => boolean][] = [
    [this.#onKeyText, (x) => typeof x.text === "string"],
    [this.#onKeyBackspace, (x) => x.name === "BACKSPACE"],
    [this.#onKeyBottom, (x) => this.params.multiLine && x.name === "DOWN" && Boolean(x.super)],
    [this.#onKeyCopy, (x) => x.name === "c" && Boolean(x.ctrl || x.super)],
    [this.#onKeyCut, (x) => x.name === "x" && Boolean(x.ctrl || x.super)],
    [this.#onKeyDelete, (x) => x.name === "DELETE"],
    [this.#onKeyDown, (x) => this.params.multiLine && x.name === "DOWN"],
    [this.#onKeyEnd, (x) => {
      if (x.name === "END") {
        return true;
      }
      if (x.name === "RIGHT" && x.super) {
        return true;
      }
      return false;
    }],
    [this.#onKeyEnter, (x) => this.params.multiLine && x.name === "ENTER"],
    [this.#onKeyHome, (x) => {
      if (x.name === "HOME") {
        return true;
      }
      if (x.name === "LEFT" && x.super) {
        return true;
      }
      return false;
    }],
    [this.#onKeyLeft, (x) => x.name === "LEFT"],
    [this.#onKeyPageDown, (x) => this.params.multiLine && x.name === "PAGE_DOWN"],
    [this.#onKeyPageUp, (x) => this.params.multiLine && x.name === "PAGE_UP"],
    [this.#onKeyPaste, (x) => x.name === "v" && Boolean(x.ctrl || x.super)],
    [this.#onKeyRedo, (x) => x.name === "y" && Boolean(x.ctrl || x.super)],
    [this.#onKeyRight, (x) => x.name === "RIGHT"],
    [this.#onKeySelectAll, (x) => x.name === "a" && Boolean(x.ctrl || x.super)],
    [this.#onKeyTab, (x) => x.name === "TAB"],
    [this.#onKeyTop, (x) => this.params.multiLine && x.name === "UP" && Boolean(x.super)],
    [this.#onKeyUndo, (x) => x.name === "z" && Boolean(x.ctrl || x.super)],
    [this.#onKeyUp, (x) => this.params.multiLine && x.name === "UP"],
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
    this.buffer.redo();
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
    this.buffer.undo();
  }

  #onKeyUp(key: kitty.Key): void {
    this.#cursor.up(1, Boolean(key.shift));
  }

  #sgr = new Intl.Segmenter();

  #insertText(text: string): void {
    this.buffer.edit(({ insert, remove }) => {
      if (this.#cursor.selecting) {
        remove(this.#cursor.from, {
          ln: this.#cursor.to.ln,
          col: this.#cursor.to.col + 1,
        });

        this.#cursor.set(this.#cursor.from.ln, this.#cursor.from.col, false);
      }

      insert(this.#cursor, text);

      const grms = [...this.#sgr.segment(text)].map((x) => graphemes.graphemes.get(x.segment));
      const eol_count = grms.filter((x) => x.isEol).length;

      if (eol_count === 0) {
        this.#cursor.forward(grms.length);
      } else {
        const col = grms.length - grms.findLastIndex((x) => x.isEol) - 1;
        this.#cursor.set(this.#cursor.ln + eol_count, col, false);
      }
    });
  }

  #backspace(): void {
    this.buffer.edit(({ remove }) => {
      if (this.#cursor.ln > 0 && this.#cursor.col === 0) {
        const len = this.buffer.line(this.#cursor.ln).take(2).reduce((a) => a + 1, 0);
        if (len === 1) {
          remove(this.#cursor, { ln: this.#cursor.ln, col: this.#cursor.col + 1 });
          this.#cursor.left(false);
        } else {
          this.#cursor.left(false);
          remove(this.#cursor, { ln: this.#cursor.ln, col: this.#cursor.col + 1 });
        }
      } else {
        remove({ ln: this.#cursor.ln, col: this.#cursor.col - 1 }, this.#cursor);
        this.#cursor.left(false);
      }
    });
  }

  #deleteChar(): void {
    this.buffer.edit(({ remove }) => {
      remove(this.#cursor, { ln: this.#cursor.ln, col: this.#cursor.col + 1 });
    });
  }

  #deleteSelection(): void {
    this.buffer.edit(({ remove }) => {
      remove(this.#cursor.from, {
        ln: this.#cursor.to.ln,
        col: this.#cursor.to.col + 1,
      });
      this.#cursor.set(this.#cursor.from.ln, this.#cursor.from.col, false);
    });
  }

  copy(): void {
    if (this.#cursor.selecting) {
      this.#clipboard = this.buffer.slice(this.#cursor.from, {
        ln: this.#cursor.to.ln,
        col: this.#cursor.to.col + 1,
      });

      this.#cursor.set(this.#cursor.ln, this.#cursor.col, false);
    } else {
      this.#clipboard = this.buffer.slice(this.#cursor, {
        ln: this.#cursor.ln,
        col: this.#cursor.col + 1,
      });
    }

    vt.copyToClipboard(vt.sync, this.#clipboard);
  }

  cut(): void {
    if (this.#cursor.selecting) {
      this.#clipboard = this.buffer.slice(this.#cursor.from, {
        ln: this.#cursor.to.ln,
        col: this.#cursor.to.col + 1,
      });

      this.#deleteSelection();
    } else {
      this.#clipboard = this.buffer.slice(this.#cursor, {
        ln: this.#cursor.ln,
        col: this.#cursor.col + 1,
      });

      this.#deleteChar();
    }

    vt.copyToClipboard(vt.sync, this.#clipboard);
  }

  paste(): void {
    if (!this.#clipboard) {
      return;
    }

    this.#insertText(this.#clipboard);
  }

  selectAll(): void {
    this.#cursor.set(0, 0, false);
    this.#cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);
  }

  #resetCursor(): void {
    if (this.params.multiLine) {
      this.#cursor.set(0, 0, false);
    } else {
      this.#cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, false);
    }

    this.#cursorHistory.reset({ ln: this.#cursor.ln, col: this.#cursor.col });
  }
}
