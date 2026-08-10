import * as documents from "@libs/documents";
import * as events from "@libs/events";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";

export type BufferSignals = {
  "name.change": () => void;
  "document.change": (_: DocumentChange) => void;
  "history.reset": () => void;
  "history.undo": () => void;
  "history.redo": () => void;
  "history.push": () => void;
};

export type DocumentChange = {
  type: "set" | "insert" | "remove" | "replace";
  fromLn: number;
  fromCol: number;
  toLn: number;
  toCol: number;
};

export class Buffer {
  readonly #emitter = new events.SignalEmitter<BufferSignals>();
  readonly #doc = new documents.Document();
  readonly #gdoc = new graphemes.Document(this.#doc);
  readonly #history = new history.History<documents.TreeNode>();
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
    return this.#history.undoCount > 0;
  }

  get chunks(): IteratorObject<string> {
    return this.#doc.read(0);
  }

  set chunks(x: string) {
    this.#doc.delete(0);
    this.#doc.insert(0, x);

    const toLn = Math.max(this.lineCount - 1, 0);
    const toCol = Math.max([...this.cells(toLn)].length - 1, 0);

    this.#emitter.broadcast("document.change", {
      type: "set",
      fromLn: 0,
      fromCol: 0,
      toLn,
      toCol,
    });

    this.resetHistory();
  }

  async load(text: AsyncIterable<string>): Promise<void> {
    await this.#doc.load(text);

    const toLn = Math.max(this.lineCount - 1, 0);
    const toCol = Math.max([...this.cells(toLn)].length - 1, 0);

    this.#emitter.broadcast("document.change", {
      type: "set",
      fromLn: 0,
      fromCol: 0,
      toLn,
      toCol,
    });

    this.resetHistory();
  }

  read(start: graphemes.Pos, end: graphemes.Pos): IteratorObject<string> {
    return this.#gdoc.read(start.ln, start.col, end.ln, end.col);
  }

  cells(ln: number, extra = false): IteratorObject<graphemes.Cell> {
    return this.#gdoc.cells(ln, extra);
  }

  insert(pos: graphemes.Pos, text: string): void {
    this.#gdoc.insert(pos.ln, pos.col, text);

    const to = { ln: pos.ln, col: pos.col };
    const { lns, cols } = graphemes.measure(text);
    if (lns === 0) {
      to.col += cols;
    } else {
      to.ln += lns;
      to.col = 0;
    }

    this.#emitter.broadcast("document.change", {
      type: "insert",
      fromLn: pos.ln,
      fromCol: pos.col,
      toLn: to.ln,
      toCol: to.col,
    });

    this.#pushHistory();
  }

  remove(from: graphemes.Pos, to: graphemes.Pos): void {
    this.#gdoc.delete(from.ln, from.col, to.ln, to.col + 1);

    this.#emitter.broadcast("document.change", {
      type: "remove",
      fromLn: from.ln,
      fromCol: from.col,
      toLn: to.ln,
      toCol: to.col,
    });

    this.#pushHistory();
  }

  replace(from: graphemes.Pos, to: graphemes.Pos, text: string): void {
    this.#gdoc.delete(from.ln, from.col, to.ln, to.col + 1);
    this.#gdoc.insert(from.ln, from.col, text);

    to = { ln: from.ln, col: from.col };
    const { lns, cols } = graphemes.measure(text);
    if (lns === 0) {
      to.col += cols;
    } else {
      to.ln += lns;
      to.col = 0;
    }

    this.#emitter.broadcast("document.change", {
      type: "replace",
      fromLn: from.ln,
      fromCol: from.col,
      toLn: to.ln,
      toCol: to.col,
    });

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

  #pushHistory(): void {
    this.#history.push(this.#doc.tree.root);

    this.#emitter.broadcast("history.push");
  }
}
