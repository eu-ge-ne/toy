import * as events from "@libs/events";
import { Grapheme, GRAPHEMES } from "@libs/grapheme";
import * as history from "@libs/history";
import { Node, String2 } from "@libs/string2";

export type BufferSignals = {
  "name.change": () => void;
  "document.change": (_: BufferChange) => void;
  "history.reset": () => void;
  "history.undo": () => void;
  "history.redo": () => void;
  "history.push": () => void;
};

export type BufferChange = {
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

  wrapWidth = Number.MAX_SAFE_INTEGER;

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
    const toCol = Math.max(this.lineLength(toLn) - 1, 0);

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
    const toCol = Math.max(this.lineLength(toLn) - 1, 0);

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
    return this.#str.read2(
      ...this.#unitPos(startLn, startCol),
      ...this.#unitPos(endLn, endCol),
    );
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

  scanLineWrap(
    ln: number,
    cb: (
      gr: Grapheme,
      i: number,
      wrapLn: number,
      wrapCol: number,
    ) => true | undefined,
  ): void {
    let gr: Grapheme;
    let i = 0;
    let wrapLn = 0;
    let wrapCol = 0;

    let currentWidth = 0;

    for (const chunk of this.#str.read2(ln, 0, ln + 1, 0)) {
      for (const x of sgr.segment(chunk)) {
        gr = GRAPHEMES.get(x.segment);

        currentWidth += gr.width;
        if (currentWidth > this.wrapWidth) {
          currentWidth = gr.width;
          wrapLn += 1;
          wrapCol = 0;
        }

        if (cb(gr, i, wrapLn, wrapCol)) {
          break;
        }

        i += 1;
        wrapCol += 1;
      }
    }
  }

  lineCursorMaxCol(ln: number): number {
    let foundEol = false;
    let col = -1;

    this.#scanLine(ln, (gr, i) => {
      col = i;
      if (gr.isEol) {
        foundEol = true;
        return true;
      }
    });

    return foundEol ? col : col + 1;
  }

  lineLength(ln: number): number {
    let length = 0;

    this.#scanLine(ln, (_, i) => {
      length = i + 1;
    });

    return length;
  }

  lineGraphemesWidths(ln: number, startCol: number, endCol: number): number[] {
    const ww: number[] = [];

    this.#scanLine(ln, (gr, i) => {
      if (i < startCol) {
        return;
      }
      if (i >= endCol) {
        return true;
      }
      ww.push(gr.width);
    });

    return ww;
  }

  lineWrapHeight(ln: number): number {
    let h = 0;

    this.scanLineWrap(ln, (_, __, ___, col) => {
      if (col === 0) {
        h += 1;
      }
    });

    return h;
  }

  getWrapLn(ln: number, col: number): number | undefined {
    let r: number | undefined;

    this.scanLineWrap(ln, (_, i, wrapLn) => {
      if (i === col) {
        r = wrapLn;
        return true;
      }
    });

    return r;
  }

  getWrapCol(ln: number, col: number): number | undefined {
    let r: number | undefined;

    this.scanLineWrap(ln, (_, i, __, wrapCol) => {
      if (i === col) {
        r = wrapCol;
        return true;
      }
    });

    return r;
  }

  #pushHistory(): void {
    this.#history.push(this.#str.tree.root);

    this.#emitter.broadcast("history.push");
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

  #scanLine(
    ln: number,
    cb: (gr: Grapheme, i: number) => true | undefined,
  ): void {
    let gr: Grapheme;
    let i = 0;

    for (const chunk of this.#str.read2(ln, 0, ln + 1, 0)) {
      for (const { segment } of sgr.segment(chunk)) {
        gr = GRAPHEMES.get(segment);

        if (cb(gr, i)) {
          break;
        }

        i += 1;
      }
    }
  }

  #unitPos(ln: number, col: number): [number, number] {
    let unitCol = 0;

    this.#scanLine(ln, (gr, i) => {
      if (i === col) {
        return true;
      }

      unitCol += gr.char.length;
    });

    return [ln, unitCol];
  }
}

function measure(text: string): { lns: number; cols: number } {
  let lns = 0;
  let cols = 0;

  for (const x of sgr.segment(text)) {
    const gr = GRAPHEMES.get(x.segment);

    if (gr.isEol) {
      lns += 1;
      cols = 0;
    } else {
      cols += 1;
    }
  }

  return { lns, cols };
}
