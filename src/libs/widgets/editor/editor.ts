import * as buffers from "@libs/buffers";
import * as history from "@libs/history";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";

import { Bg } from "../bg/bg.ts";
import { Widget } from "../widget.ts";
import { Content } from "./content.ts";
import { Cursor, Pos } from "./cursor.ts";
import { InputHandler, multiLineHandlers, singleLineHandlers } from "./handlers/index.ts";

interface Params {
  multiLine: boolean;
}

export class Editor extends Widget<Params> {
  private readonly handlers: InputHandler[];
  private readonly history = new history.History<Pos>();
  private clipboard = "";

  protected override children: {
    bg: Bg;
    content: Content;
  };

  constructor(readonly buffer: buffers.Buffer, params: Params) {
    super(params);

    this.cursor = new Cursor(buffer);

    this.children = {
      bg: new Bg(),
      content: new Content(buffer, this.cursor),
    };

    this.handlers = [
      new singleLineHandlers.SelectAll(this),
      new singleLineHandlers.CursorLeft(this),
      new singleLineHandlers.CursorRight(this),
      new singleLineHandlers.CursorHome(this),
      new singleLineHandlers.CursorEnd(this),
      new singleLineHandlers.Tab(this),
      new singleLineHandlers.Delete(this),
      ...(!this.params.multiLine ? [] : [
        new multiLineHandlers.CursorUp(this),
        new multiLineHandlers.CursorDown(this),
        new multiLineHandlers.CursorTop(this),
        new multiLineHandlers.CursorBottom(this),
        new multiLineHandlers.CursorPageUp(this),
        new multiLineHandlers.CursorPageDown(this),
        new multiLineHandlers.Enter(this),
      ]),
    ];

    this.#resetHistory();

    buffer.signals.on("buffer.change")(this.#onBufferChange.bind(this));
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
    for (const handler of this.handlers) {
      if (handler.match(key)) {
        handler.handle(key);
        break;
      }
    }

    if (typeof key.text === "string") {
      if (this.cursor.isSelecting) {
        this.buffer.replace(this.cursor.from, this.cursor.to, key.text!);
      } else {
        this.buffer.insert(this.cursor.pos, key.text!);
      }
      return;
    }

    if (key.name === "BACKSPACE") {
      const { pos, from, to } = this.cursor;
      if (this.cursor.isSelecting) {
        this.buffer.remove(from, to);
      } else {
        if (pos.col > 0) {
          const p = { ln: pos.ln, col: pos.col - 1 };
          this.buffer.remove(p, p);
        } else if (pos.ln > 0) {
          const ln = pos.ln - 1;
          const prevLine = this.buffer.cells(ln);
          const col = [...prevLine].length - 1;
          const p = { ln, col };
          this.buffer.remove(p, p);
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

    this.clipboard = [...this.buffer.read(from, { ln: to.ln, col: to.col + 1 })].join("");
    vt.copyToClipboard(vt.sync, this.clipboard);

    if (this.cursor.isSelecting) {
      this.cursor.set(pos, false);
    }
  }

  cut(): void {
    const { from, to } = this.cursor;

    this.clipboard = [...this.buffer.read(from, { ln: to.ln, col: to.col + 1 })].join("");
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

  #onBufferChange(change: buffers.BufferChange) {
    switch (change.type) {
      case "insert":
      case "replace":
        this.cursor.set(change.to, false);
        break;
      case "remove":
        this.cursor.set(change.from, false);
        break;
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
    if (entry) {
      this.cursor.set(entry, false);
    }
  }

  #redoHistory() {
    const entry = this.history.redo();
    if (entry) {
      this.cursor.set(entry, false);
    }
  }
}
