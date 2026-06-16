import * as buffers from "@libs/buffers";
import * as history from "@libs/history";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";

import { Bg } from "../bg/bg.ts";
import { Widget } from "../widget.ts";
import { Content } from "./content.ts";
import { Cursor, Pos } from "./cursor.ts";

interface Params {
  multiLine: boolean;
}

export class Editor extends Widget<Params> {
  private readonly history = new history.History<Pos>();
  private clipboard = "";

  protected override children: {
    bg: Bg;
    content: Content;
  };

  constructor(private readonly buffer: buffers.Buffer, params: Params) {
    super(params);

    this.cursor = new Cursor(buffer);

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
      if (this.cursor.isSelecting) {
        this.buffer.replace(this.cursor.from, this.cursor.to, key.text!);
      } else {
        this.buffer.insert(this.cursor.pos, key.text!);
      }
      return;
    }

    if (key.name === "TAB") {
      if (this.cursor.isSelecting) {
        this.buffer.replace(this.cursor.from, this.cursor.to, "\t");
      } else {
        this.buffer.insert(this.cursor.pos, "\t");
      }
      return;
    }

    if (this.params.multiLine && key.name === "ENTER") {
      if (this.cursor.isSelecting) {
        this.buffer.replace(this.cursor.from, this.cursor.to, "\n");
      } else {
        this.buffer.insert(this.cursor.pos, "\n");
      }
      return;
    }

    if (key.name === "DELETE") {
      const { from, to } = this.cursor;
      this.buffer.remove(from, { ln: to.ln, col: to.col + 1 });
      return;
    }

    if (key.name === "BACKSPACE") {
      const { pos, from, to } = this.cursor;
      if (this.cursor.isSelecting) {
        this.buffer.remove(from, { ln: to.ln, col: to.col + 1 });
      } else {
        if (pos.col > 0) {
          this.buffer.remove({ ln: pos.ln, col: pos.col - 1 }, pos);
        } else if (pos.ln > 0) {
          const ln = pos.ln - 1;
          const prevLine = this.buffer.line(ln);
          const col = [...prevLine].length - 1;
          this.buffer.remove({ ln, col }, pos);
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
    const { pos, from, to } = this.cursor;

    this.clipboard = this.buffer.slice(from, { ln: to.ln, col: to.col + 1 });
    vt.copyToClipboard(vt.sync, this.clipboard);

    if (this.cursor.isSelecting) {
      this.cursor.set(pos, false);
    }
  }

  cut(): void {
    const { from, to } = this.cursor;

    this.clipboard = this.buffer.slice(from, { ln: to.ln, col: to.col + 1 });
    vt.copyToClipboard(vt.sync, this.clipboard);

    this.buffer.remove(from, { ln: to.ln, col: to.col + 1 });
  }

  paste(): void {
    if (!this.clipboard) {
      return;
    }

    if (this.cursor.isSelecting) {
      this.buffer.replace(this.cursor.from, this.cursor.to, this.clipboard);
    } else {
      this.buffer.insert(this.cursor.pos, this.clipboard);
    }
  }

  #resetHistory(): void {
    if (this.params.multiLine) {
      this.cursor.set({ ln: 0, col: 0 }, false);
    } else {
      this.cursor.set({ ln: Number.MAX_SAFE_INTEGER, col: Number.MAX_SAFE_INTEGER }, false);
    }

    this.history.reset(this.cursor.pos);
  }

  #pushHistory() {
    this.history.push(this.cursor.pos);
  }

  #undoHistory() {
    const entry = this.history.undo();
    if (!entry) {
      return;
    }

    this.cursor.set(entry, false);
  }

  #redoHistory() {
    const entry = this.history.redo();
    if (!entry) {
      return;
    }

    this.cursor.set(entry, false);
  }
}
