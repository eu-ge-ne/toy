import * as documents from "@libs/documents";
import * as events from "@libs/events";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";
import * as kitty from "@libs/kitty";

export type BufferSignals = {
  "change": () => void;
  "change.name": () => void;
  "history.push": () => void;
  "history.undo": () => void;
  "history.redo": () => void;
  "history.reset": () => void;
};

export class Buffer {
  readonly #emitter = new events.SignalEmitter<BufferSignals>();
  readonly #doc = new documents.Document();
  readonly #gDoc = new graphemes.Document(this.#doc);
  readonly #history = new history.History<documents.Node>();
  #name = "";

  constructor() {
    this.resetUndo();
  }

  readonly signals = this.#emitter.listener;

  get name(): string {
    return this.#name;
  }

  set name(x: string) {
    this.#name = x;

    this.#emitter.broadcast("change.name");
  }

  get lineCount(): number {
    return this.#doc.lineCount;
  }

  get modified(): boolean {
    return !this.#history.empty;
  }

  get text(): string {
    return this.#doc.read(0).reduce((a, x) => a + x, "");
  }

  set text(x: string) {
    this.#doc.delete(0);
    this.#doc.insert(0, x);

    this.#emitter.broadcast("change");

    this.resetUndo();
  }

  async rewrite(text: AsyncIterable<string>): Promise<void> {
    await this.#doc.rewrite(text);

    this.#emitter.broadcast("change");

    this.resetUndo();
  }

  read(): Iterable<string> {
    return this.#doc.read(0);
  }

  slice(start: graphemes.Pos, end: graphemes.Pos): string {
    return this.#gDoc.read(start, end);
  }

  line(ln: number, extra = false): IteratorObject<graphemes.Segment> {
    return this.#gDoc.line(ln, extra);
  }

  edit(
    fn: (
      _: {
        insert: (pos: graphemes.Pos, text: string) => void;
        remove: (start: graphemes.Pos, end: graphemes.Pos) => void;
      },
    ) => void,
  ): void {
    let changed = false;

    fn({
      insert: (pos: graphemes.Pos, text: string) => {
        this.#gDoc.insert(pos, text);
        changed = true;
      },
      remove: (start: graphemes.Pos, end: graphemes.Pos) => {
        this.#gDoc.delete(start, end);
        changed = true;
      },
    });

    if (changed) {
      this.#history.push(this.#doc.tree.root);

      this.#emitter.broadcast("change");
      this.#emitter.broadcast("history.push");
    }
  }

  undo(): void {
    const entry = this.#history.undo();
    if (!entry) {
      return;
    }

    this.#doc.tree.root = entry;

    this.#emitter.broadcast("change");
    this.#emitter.broadcast("history.undo");
  }

  redo(): void {
    const entry = this.#history.redo();
    if (!entry) {
      return;
    }

    this.#doc.tree.root = entry;

    this.#emitter.broadcast("change");
    this.#emitter.broadcast("history.redo");
  }

  resetUndo(): void {
    this.#history.reset(this.#doc.tree.root);

    this.#emitter.broadcast("history.reset");
  }

  handleKey(key: kitty.Key): boolean {
    if (key.name === "z" && (key.ctrl || key.super)) {
      this.undo();
      return true;
    }

    if (key.name === "y" && (key.ctrl || key.super)) {
      this.redo();
      return true;
    }

    return false;
  }
}
