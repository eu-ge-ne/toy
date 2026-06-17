import * as documents from "@libs/documents";
import * as events from "@libs/events";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";

export type BufferSignals = {
  "name.change": () => void;
  "buffer.change": (_: BufferChange) => void;
  "history.reset": () => void;
  "history.undo": () => void;
  "history.redo": () => void;
  "history.push": () => void;
};

export type BufferChange = {
  type: "set" | "insert" | "remove" | "replace";
  from: graphemes.Pos;
  to: graphemes.Pos;
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

  // TODO: rename
  async rewrite(text: AsyncIterable<string>): Promise<void> {
    await this.#doc.rewrite(text);

    // TODO
    this.#emitter.broadcast("buffer.change", {
      type: "set",
      from: { ln: 0, col: 0 },
      to: { ln: 0, col: 0 },
    });

    this.resetHistory();
  }

  read1D(): IteratorObject<string> {
    return this.#doc.read(0);
  }

  readStringSlice(start: graphemes.Pos, end: graphemes.Pos): string {
    return this.#gDoc.read(start, end);
  }

  readGraphemeLine(ln: number, extra = false): IteratorObject<graphemes.Segment> {
    return this.#gDoc.line(ln, extra);
  }

  // TODO

  writeString(text: string) {
    this.#doc.delete(0);
    this.#doc.insert(0, text);

    // TODO
    this.#emitter.broadcast("buffer.change", {
      type: "set",
      from: { ln: 0, col: 0 },
      to: { ln: 0, col: 0 },
    });

    this.resetHistory();
  }

  insert(pos: graphemes.Pos, text: string): void {
    this.#gDoc.insert(pos, text);

    const to = { ln: pos.ln, col: pos.col };
    const { lns, cols } = graphemes.measure(text);
    if (lns === 0) {
      to.col += cols;
    } else {
      to.ln += lns;
      to.col = 0;
    }

    this.#emitter.broadcast("buffer.change", { type: "insert", from: pos, to });

    this.#pushHistory();
  }

  remove(from: graphemes.Pos, to: graphemes.Pos): void {
    this.#gDoc.delete(from, { ln: to.ln, col: to.col + 1 });

    this.#emitter.broadcast("buffer.change", { type: "remove", from, to: from });

    this.#pushHistory();
  }

  replace(from: graphemes.Pos, to: graphemes.Pos, text: string): void {
    this.#gDoc.delete(from, { ln: to.ln, col: to.col + 1 });
    this.#gDoc.insert(from, text);

    to = { ln: from.ln, col: from.col };
    const { lns, cols } = graphemes.measure(text);
    if (lns === 0) {
      to.col += cols;
    } else {
      to.ln += lns;
      to.col = 0;
    }

    this.#emitter.broadcast("buffer.change", { type: "replace", from, to });

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
