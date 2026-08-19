import * as events from "@libs/events";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";
import { Node, String2 } from "@libs/string2";
import * as vt from "@libs/vt";

import { Cell, measure, settings } from "./segmenter.ts";

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

const sgr = new Intl.Segmenter();

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

  *cells(ln: number, extra = false): Generator<Cell> {
    const chunks = this.#str.read2(ln, 0, ln + 1, 0);

    const seg: Cell = {
      i: 0,
      gr: undefined as unknown as graphemes.Grapheme,
      ln: 0,
      col: 0,
    };

    let w = 0;

    for (const chunk of chunks) {
      for (const { segment } of sgr.segment(chunk)) {
        seg.gr = graphemes.graphemes.get(segment);

        if (seg.gr.width < 0) {
          seg.gr.width = vt.wchar(settings.y, settings.x, seg.gr.bytes);
        }

        w += seg.gr.width;
        if (w > settings.width) {
          w = seg.gr.width;
          seg.ln += 1;
          seg.col = 0;
        }

        yield seg;

        seg.i += 1;
        seg.col += 1;
      }
    }

    if (extra) {
      seg.gr = graphemes.graphemes.get(" ");

      w += seg.gr.width;
      if (w > settings.width) {
        w = seg.gr.width;
        seg.ln += 1;
        seg.col = 0;
      }

      yield seg;
    }
  }

  insert(ln: number, col: number, text: string): void {
    this.#insert(ln, col, text);

    let toLn = ln;
    let toCol = col;
    const { lns, cols } = measure(text);
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
    const { lns, cols } = measure(text);
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

    for (const { gr } of this.cells(ln)) {
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
