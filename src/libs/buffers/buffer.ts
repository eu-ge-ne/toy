import * as events from "@libs/events";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";
import { Node, String2 } from "@libs/string2";

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
  readonly #str = new String2();
  readonly #history = new history.History<Node>();
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
    return this.#str.lineCount;
  }

  get modified(): boolean {
    return this.#history.undoCount > 0;
  }

  get chunks(): IteratorObject<string> {
    return this.#str.read(0);
  }

  set chunks(x: string) {
    this.#str.delete(0);
    this.#str.insert(0, x);

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
    await this.#str.load(text);

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

  read(
    startLn: number,
    startCol: number,
    endLn: number,
    endCol: number,
  ): IteratorObject<string> {
    return this.#read(startLn, startCol, endLn, endCol);
  }

  cells(ln: number, extra = false): IteratorObject<graphemes.Cell> {
    return this.#cells(ln, extra);
  }

  insert(ln: number, col: number, text: string): void {
    this.#insert(ln, col, text);

    let toLn = ln;
    let toCol = col;
    const { lns, cols } = graphemes.measure(text);
    if (lns === 0) {
      toCol += cols;
    } else {
      toLn += lns;
      toCol = 0;
    }

    this.#emitter.broadcast("document.change", {
      type: "insert",
      fromLn: ln,
      fromCol: col,
      toLn: toLn,
      toCol: toCol,
    });

    this.#pushHistory();
  }

  remove(fromLn: number, fromCol: number, toLn: number, toCol: number): void {
    this.#delete(fromLn, fromCol, toLn, toCol + 1);

    this.#emitter.broadcast("document.change", {
      type: "remove",
      fromLn,
      fromCol,
      toLn,
      toCol,
    });

    this.#pushHistory();
  }

  replace(
    fromLn: number,
    fromCol: number,
    toLn: number,
    toCol: number,
    text: string,
  ): void {
    this.#delete(fromLn, fromCol, toLn, toCol + 1);
    this.#insert(fromLn, fromCol, text);

    toLn = fromLn;
    toCol = fromCol;
    const { lns, cols } = graphemes.measure(text);
    if (lns === 0) {
      toCol += cols;
    } else {
      toLn += lns;
      toCol = 0;
    }

    this.#emitter.broadcast("document.change", {
      type: "replace",
      fromLn,
      fromCol,
      toLn,
      toCol,
    });

    this.#pushHistory();
  }

  resetHistory(): void {
    this.#history.reset(this.#str.tree.root);

    this.#emitter.broadcast("history.reset");
  }

  undoHistory(): void {
    const entry = this.#history.undo();
    if (!entry) {
      return;
    }

    this.#str.tree.root = entry;

    this.#emitter.broadcast("history.undo");
  }

  redoHistory(): void {
    const entry = this.#history.redo();
    if (!entry) {
      return;
    }

    this.#str.tree.root = entry;

    this.#emitter.broadcast("history.redo");
  }

  #pushHistory(): void {
    this.#history.push(this.#str.tree.root);

    this.#emitter.broadcast("history.push");
  }

  #cells(ln: number, extra = false): IteratorObject<graphemes.Cell> {
    const chunks = this.#str.read2(ln, 0, ln + 1, 0);
    return graphemes.segments(chunks, extra);
  }

  #read(
    startLn: number,
    startCol: number,
    endLn: number,
    endCol: number,
  ): IteratorObject<string> {
    return this.#str.read2(
      ...this.#unitPos(startLn, startCol),
      ...this.#unitPos(endLn, endCol),
    );
  }

  #insert(ln: number, col: number, text: string): void {
    this.#str.insert2(...this.#unitPos(ln, col), text);
  }

  #delete(
    startLn: number,
    startCol: number,
    endLn: number,
    endCol: number,
  ): void {
    this.#str.delete2(
      ...this.#unitPos(startLn, startCol),
      ...this.#unitPos(endLn, endCol),
    );
  }

  #unitPos(ln: number, col: number): [number, number] {
    let unit_col = 0;
    let i = 0;

    for (const { gr } of this.#cells(ln)) {
      if (i === col) {
        break;
      }

      if (i < col) {
        unit_col += gr.char.length;
      }

      i += 1;
    }

    return [ln, unit_col];
  }
}
