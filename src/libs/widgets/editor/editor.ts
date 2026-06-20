import * as buffers from "@libs/buffers";
import * as history from "@libs/history";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";

import { Bg } from "../bg/bg.ts";
import { Widget } from "../widget.ts";
import { Content } from "./content.ts";
import { Cursor, Pos } from "./cursor.ts";
import { cursorHandlers, editHandlers, InputHandler, multiLineHandlers } from "./handlers/index.ts";

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
      ...editHandlers.map((x) => new x(this)),
      ...cursorHandlers.map((x) => new x(this)),
      ...(!this.params.multiLine ? [] : [
        ...multiLineHandlers.map((x) => new x(this)),
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
    for (const x of this.handlers) {
      if (x.match(key)) {
        x.handle(key);
        break;
      }
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
