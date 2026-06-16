import * as documents from "@libs/documents";
import * as events from "@libs/events";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";

export type BufferSignals = {
  "name.change": () => void;
  "buffer.change": () => void;
  "history.reset": () => void;
  "history.undo": () => void;
  "history.redo": () => void;
  "history.push": () => void;
};

export class Buffer {
  readonly #emitter = new events.SignalEmitter<BufferSignals>();
  readonly #doc = new documents.Document();
  readonly #gDoc = new graphemes.Document(this.#doc);
  readonly #history = new history.History<documents.Node>();
  #name = "";

  constructor() {
    this.resetHistory();
  }

  readonly signals = this.#emitter.listener;

  get name(): string {
    return this.#name;
  }

  set name(x: string) {
    this.#name = x;

    this.#emitter.broadcast("name.change");
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
    this.#emitter.broadcast("buffer.change");

    this.resetHistory();
  }

  async rewrite(text: AsyncIterable<string>): Promise<void> {
    await this.#doc.rewrite(text);
    this.#emitter.broadcast("buffer.change");

    this.resetHistory();
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

  remove(start: graphemes.Pos, end: graphemes.Pos): void {
    this.#gDoc.delete(start, end);
    this.#emitter.broadcast("buffer.change");

    this.#pushHistory();
  }

  replace(start: graphemes.Pos, end: graphemes.Pos, text: string): void {
    this.#gDoc.delete(start, end);
    this.#gDoc.insert(start, text);
    this.#emitter.broadcast("buffer.change");

    this.#pushHistory();
  }

  insert(pos: graphemes.Pos, text: string): void {
    this.#gDoc.insert(pos, text);
    this.#emitter.broadcast("buffer.change");

    this.#pushHistory();
  }

  resetHistory(): void {
    this.#history.reset(this.#doc.tree.root);

    this.#emitter.broadcast("history.reset");
  }

  undoHistory(): void {
    const entry = this.#history.undo();
    if (!entry) {
      return;
    }

    this.#doc.tree.root = entry;

    this.#emitter.broadcast("history.undo");
  }

  redoHistory(): void {
    const entry = this.#history.redo();
    if (!entry) {
      return;
    }

    this.#doc.tree.root = entry;

    this.#emitter.broadcast("history.redo");
  }

  #pushHistory() {
    this.#history.push(this.#doc.tree.root);

    this.#emitter.broadcast("history.push");
  }
}
