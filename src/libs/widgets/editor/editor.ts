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
  private readonly history = new history.History<{ ln: number; col: number }>();
  private clipboard = "";

  protected override children: {
    bg: Bg;
    content: Content;
  };

  constructor(private readonly buffer: buffers.Buffer, params: Params) {
    super(params);

    this.cursor = new Cursor(buffer);
    this.cursor.onChange = () =>
      params.onCursorChange?.({ ln: this.cursor.ln, col: this.cursor.col });

    this.children = {
      bg: new Bg(),
      content: new Content(buffer, this.cursor),
    };

    this.#resetHistory();

    buffer.signals.on("history.push")(this.#pushHistory.bind(this));
    buffer.signals.on("history.undo")(this.#undoHistory.bind(this));
    buffer.signals.on("history.redo")(this.#redoHistory.bind(this));
    buffer.signals.on("history.reset")(this.#resetHistory.bind(this));
  }

  readonly cursor: Cursor;

  protected override resizeChildren(): void {
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
    this.cursor.home(false);
  }

  toggleWhitespace(): void {
    this.children.content.toggleWhitespace();
  }

  toggleIndex(): void {
    this.children.content.toggleIndex();
  }

  handleInput(key: kitty.Key): void {
    // Cursor

    if (key.name === "LEFT") {
      this.cursor.left(Boolean(key.shift));
      return;
    }

    if (key.name === "RIGHT") {
      this.cursor.right(Boolean(key.shift));
      return;
    }

    if (this.params.multiLine && key.name === "UP") {
      this.cursor.up(1, Boolean(key.shift));
      return;
    }

    if (this.params.multiLine && key.name === "DOWN") {
      this.cursor.down(1, Boolean(key.shift));
      return;
    }

    if (this.params.multiLine && key.name === "UP" && Boolean(key.super)) {
      this.cursor.top(Boolean(key.shift));
      return;
    }

    if (this.params.multiLine && key.name === "DOWN" && Boolean(key.super)) {
      this.cursor.bottom(Boolean(key.shift));
      return;
    }

    let isHome = false;
    if (key.name === "HOME") {
      isHome = true;
    }
    if (key.name === "LEFT" && key.super) {
      isHome = true;
    }
    if (isHome) {
      this.cursor.home(Boolean(key.shift));
      return;
    }

    let isEnd = false;
    if (key.name === "END") {
      isEnd = true;
    }
    if (key.name === "RIGHT" && key.super) {
      isEnd = true;
    }
    if (isEnd) {
      this.cursor.end(Boolean(key.shift));
      return;
    }

    if (this.params.multiLine && key.name === "PAGE_UP") {
      this.cursor.up(this.height, Boolean(key.shift));
      return;
    }

    if (this.params.multiLine && key.name === "PAGE_DOWN") {
      this.cursor.down(this.height, Boolean(key.shift));
      return;
    }

    if (key.name === "a" && Boolean(key.ctrl || key.super)) {
      this.cursor.selectAll();
      return;
    }

    // Edit

    if (typeof key.text === "string") {
      this.#insertText(key.text!);
      return;
    }

    if (key.name === "TAB") {
      this.#insertText("\t");
      return;
    }

    if (this.params.multiLine && key.name === "ENTER") {
      this.#insertText("\n");
      return;
    }

    if (key.name === "DELETE") {
      if (this.cursor.isSelecting) {
        this.buffer.remove(this.cursor.from, {
          ln: this.cursor.to.ln,
          col: this.cursor.to.col + 1,
        });
      } else {
        this.buffer.remove(this.cursor, { ln: this.cursor.ln, col: this.cursor.col + 1 });
      }
      return;
    }

    if (key.name === "BACKSPACE") {
      if (this.cursor.isSelecting) {
        this.buffer.remove(this.cursor.from, {
          ln: this.cursor.to.ln,
          col: this.cursor.to.col + 1,
        });
      } else {
        if (this.cursor.ln > 0 && this.cursor.col === 0) {
          const len = this.buffer.line(this.cursor.ln).take(2).reduce((a) => a + 1, 0);
          if (len === 1) {
            this.buffer.remove(this.cursor, { ln: this.cursor.ln, col: this.cursor.col + 1 });
            this.cursor.left(false);
          } else {
            this.cursor.left(false);
            this.buffer.remove(this.cursor, { ln: this.cursor.ln, col: this.cursor.col + 1 });
          }
        } else {
          this.buffer.remove({ ln: this.cursor.ln, col: this.cursor.col - 1 }, this.cursor);
          this.cursor.left(false);
        }
      }
      return;
    }

    if (key.name === "c" && Boolean(key.ctrl || key.super)) {
      this.copy();
      return;
    }

    if (key.name === "x" && Boolean(key.ctrl || key.super)) {
      this.cut();
      return;
    }

    if (key.name === "v" && Boolean(key.ctrl || key.super)) {
      this.paste();
      return;
    }

    if (key.name === "z" && (key.ctrl || key.super)) {
      this.buffer.undoHistory();
      return;
    }

    if (key.name === "y" && (key.ctrl || key.super)) {
      this.buffer.redoHistory();
      return;
    }
  }

  copy(): void {
    if (this.cursor.isSelecting) {
      this.clipboard = this.buffer.slice(this.cursor.from, {
        ln: this.cursor.to.ln,
        col: this.cursor.to.col + 1,
      });

      this.cursor.set(this.cursor.ln, this.cursor.col, false);
    } else {
      this.clipboard = this.buffer.slice(this.cursor, {
        ln: this.cursor.ln,
        col: this.cursor.col + 1,
      });
    }

    vt.copyToClipboard(vt.sync, this.clipboard);
  }

  cut(): void {
    if (this.cursor.isSelecting) {
      this.clipboard = this.buffer.slice(this.cursor.from, {
        ln: this.cursor.to.ln,
        col: this.cursor.to.col + 1,
      });

      this.buffer.remove(this.cursor.from, {
        ln: this.cursor.to.ln,
        col: this.cursor.to.col + 1,
      });
    } else {
      this.clipboard = this.buffer.slice(this.cursor, {
        ln: this.cursor.ln,
        col: this.cursor.col + 1,
      });

      this.buffer.remove(this.cursor, { ln: this.cursor.ln, col: this.cursor.col + 1 });
    }

    vt.copyToClipboard(vt.sync, this.clipboard);
  }

  paste(): void {
    if (!this.clipboard) {
      return;
    }

    this.#insertText(this.clipboard);
  }

  #resetHistory(): void {
    if (this.params.multiLine) {
      this.cursor.set(0, 0, false);
    } else {
      this.cursor.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, false);
    }

    this.history.reset({ ln: this.cursor.ln, col: this.cursor.col });
  }

  #pushHistory() {
    if (this.cursor.isSelecting) {
      // TODO: remove
      this.cursor.set(this.cursor.from.ln, this.cursor.from.col, false);
    }

    this.history.push({ ln: this.cursor.ln, col: this.cursor.col });
  }

  #undoHistory() {
    const entry = this.history.undo();
    if (!entry) {
      return;
    }

    if (this.cursor.isSelecting) {
      // TODO: remove
      this.cursor.set(this.cursor.from.ln, this.cursor.from.col, false);
    }

    this.cursor.set(entry.ln, entry.col, false);
  }

  #redoHistory() {
    const entry = this.history.redo();
    if (!entry) {
      return;
    }

    if (this.cursor.isSelecting) {
      // TODO: remove
      this.cursor.set(this.cursor.from.ln, this.cursor.from.col, false);
    }

    this.cursor.set(entry.ln, entry.col, false);
  }

  #sgr = new Intl.Segmenter();

  #insertText(text: string): void {
    this.buffer.edit(({ insert, remove }) => {
      if (this.cursor.isSelecting) {
        remove(this.cursor.from, {
          ln: this.cursor.to.ln,
          col: this.cursor.to.col + 1,
        });

        this.cursor.set(this.cursor.from.ln, this.cursor.from.col, false);
      }

      insert(this.cursor, text);

      const grms = [...this.#sgr.segment(text)].map((x) => graphemes.graphemes.get(x.segment));
      const eol_count = grms.filter((x) => x.isEol).length;

      if (eol_count === 0) {
        this.cursor.forward(grms.length);
      } else {
        const col = grms.length - grms.findLastIndex((x) => x.isEol) - 1;
        this.cursor.set(this.cursor.ln + eol_count, col, false);
      }
    });
  }
}
