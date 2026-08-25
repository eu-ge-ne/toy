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

type BufferCell = {
  i: number;
  gr: Grapheme;
  ln: number;
  col: number;
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

  width = Number.MAX_SAFE_INTEGER;

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
    const toCol = Math.max([...this.lineCells(toLn)].length - 1, 0);

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
    const toCol = Math.max([...this.lineCells(toLn)].length - 1, 0);

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

  #cell: BufferCell = {
    i: 0,
    gr: undefined as unknown as Grapheme,
    ln: 0,
    col: 0,
  };

  scanLineCells(
    startLn: number,
    extra: boolean,
    cb: (gr: Grapheme, i: number, ln: number, col: number) => true | undefined,
  ): void {
    let i = 0;
    let ln = 0;
    let col = 0;
    let gr: Grapheme;

    let w = 0;

    for (const chunk of this.#str.read2(startLn, 0, startLn + 1, 0)) {
      for (const { segment } of sgr.segment(chunk)) {
        gr = GRAPHEMES.get(segment);

        w += gr.width;
        if (w > this.width) {
          w = gr.width;
          ln += 1;
          col = 0;
        }

        if (cb(gr, i, ln, col)) {
          break;
        }

        i += 1;
        col += 1;
      }
    }

    if (extra) {
      gr = GRAPHEMES.get(" ");

      w += gr.width;
      if (w > this.width) {
        w = gr.width;
        ln += 1;
        col = 0;
      }

      cb(gr, i, ln, col);
    }
  }

  *lineCells(ln: number, extra = false): Generator<BufferCell> {
    this.#cell.i = 0;
    this.#cell.ln = 0;
    this.#cell.col = 0;

    let w = 0;

    for (const chunk of this.#str.read2(ln, 0, ln + 1, 0)) {
      for (const { segment } of sgr.segment(chunk)) {
        this.#cell.gr = GRAPHEMES.get(segment);

        w += this.#cell.gr.width;
        if (w > this.width) {
          w = this.#cell.gr.width;
          this.#cell.ln += 1;
          this.#cell.col = 0;
        }

        yield this.#cell;

        this.#cell.i += 1;
        this.#cell.col += 1;
      }
    }

    if (extra) {
      this.#cell.gr = GRAPHEMES.get(" ");

      w += this.#cell.gr.width;
      if (w > this.width) {
        w = this.#cell.gr.width;
        this.#cell.ln += 1;
        this.#cell.col = 0;
      }

      yield this.#cell;
    }
  }

  lineHeight(ln: number): number {
    return this.lineCells(ln).reduce(
      (a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0),
      1,
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

  #unitPos(ln: number, col: number): [number, number] {
    let unitCol = 0;

    this.scanLineCells(ln, false, (gr, i) => {
      if (i === col) {
        return true;
      }

      if (i < col) {
        unitCol += gr.char.length;
      }
    });

    return [ln, unitCol];
  }
}

function measure(text: string): { lns: number; cols: number } {
  let lns = 0;
  let cols = 0;

  for (const { segment } of sgr.segment(text)) {
    const gr = GRAPHEMES.get(segment);

    if (gr.isEol) {
      lns += 1;
      cols = 0;
    } else {
      cols += 1;
    }
  }

  return { lns, cols };
}
