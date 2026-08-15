import { Buf } from "./buf.ts";

export class Node {
  readonly #buf: Buf;

  #start = 0;
  #end = 0;
  #eolStart = 0;
  #eolEnd = 0;

  red: boolean;
  p: Node;
  #left: Node;
  #right: Node;

  #totalCharCount: number;
  #totalEolCount: number;

  private constructor(
    nil: Node | undefined,
    buf: Buf,
    start: number,
    end: number,
    eolStart: number,
    eolEnd: number,
    red: boolean,
  ) {
    this.#buf = buf;

    this.#start = start;
    this.#end = end;
    this.#eolStart = eolStart;
    this.#eolEnd = eolEnd;

    this.red = red;
    this.p = nil ?? this;
    this.#left = nil ?? this;
    this.#right = nil ?? this;

    this.#totalCharCount = this.charCount;
    this.#totalEolCount = this.eolCount;
  }

  static NIL = new Node(
    undefined,
    new Buf(""),
    0,
    0,
    0,
    0,
    false,
  );

  static create(buf: Buf, start: number, end: number): Node {
    return new Node(
      Node.NIL,
      buf,
      start,
      end,
      buf.charToLine(start),
      buf.charToLine(end),
      true,
    );
  }

  clone(): Node {
    if (this.isNIL) {
      return this;
    }

    const node = new Node(
      Node.NIL,
      this.#buf,
      this.#start,
      this.#end,
      this.#eolStart,
      this.#eolEnd,
      this.red,
    );

    node.p = this.p;
    node.#left = this.#left.clone();
    node.#right = this.#right.clone();

    node.#totalCharCount = this.#totalCharCount;
    node.#totalEolCount = this.#totalEolCount;

    return node;
  }

  *read(start: number, n: number): Generator<string> {
    let x = this as Node;

    while (!x.isNIL && (n > 0)) {
      const count = Math.min(x.charCount - start, n);
      const s = x.start + start;
      const e = s + count;

      yield x.#buf.text.slice(s, e);

      start = 0;
      n -= count;

      x = x.successor();
    }
  }

  append(text: string): void {
    if (!this.isGrowable) {
      throw new Error("TreeNode is not growable");
    }

    this.#buf.append(text);

    this.#resize(this.charCount + text.length);
  }

  trimStart(n: number): void {
    this.start = this.start + n;
  }

  trimEnd(n: number): void {
    this.#resize(this.charCount - n);
  }

  split(i: number): Node {
    const start = this.#start + i;
    const end = this.#end;

    this.#resize(i);

    return Node.create(this.#buf, start, end);
  }

  get isNIL(): boolean {
    return this === Node.NIL;
  }

  get isGrowable(): boolean {
    return this.#buf.isGrowable && (this.end === this.#buf.text.length);
  }

  get left(): Node {
    return this.#left;
  }

  set left(x: Node) {
    this.#left = x;

    this.#updateTotals();
  }

  get right(): Node {
    return this.#right;
  }

  set right(x: Node) {
    this.#right = x;

    this.#updateTotals();
  }

  get charCount(): number {
    return this.#end - this.#start;
  }

  get eolCount(): number {
    return this.#eolEnd - this.#eolStart;
  }

  get start(): number {
    return this.#start;
  }

  set start(x: number) {
    this.#start = x;

    this.#eolStart = this.#buf.charToLine(x);

    this.#updateTotals();
  }

  get end(): number {
    return this.#end;
  }

  set end(x: number) {
    this.#end = x;

    this.#eolEnd = this.#buf.charToLine(x);

    this.#updateTotals();
  }

  get eolStart(): number {
    return this.#eolStart;
  }

  get eolEnd(): number {
    return this.#eolEnd;
  }

  get totalCharCount(): number {
    return this.#totalCharCount;
  }

  get totalEolCount(): number {
    return this.#totalEolCount;
  }

  minimum(): Node {
    let x = this as Node;
    while (!x.left.isNIL) {
      x = x.left;
    }
    return x;
  }

  maximum(): Node {
    let x = this as Node;
    while (!x.right.isNIL) {
      x = x.right;
    }
    return x;
  }

  successor(): Node {
    let x = this as Node;

    if (!x.right.isNIL) {
      return this.right.minimum();
    } else {
      let y = x.p;

      while (!y.isNIL && x === y.right) {
        x = y;
        y = y.p;
      }

      return y;
    }
  }

  findLineStart(ln: number): number | undefined {
    if (ln === 0) {
      return 0;
    }

    let eolIndex = ln - 1;
    let x = this as Node;
    let i = 0;

    while (!x.isNIL) {
      if (eolIndex < x.left.totalEolCount) {
        x = x.left;
        continue;
      }

      eolIndex -= x.left.totalEolCount;
      i += x.left.totalCharCount;

      if (eolIndex < x.eolCount) {
        const eol_end = x.#buf.eols[x.eolStart + eolIndex]!.end;
        return i + eol_end - x.start;
      }

      eolIndex -= x.eolCount;
      i += x.charCount;
      x = x.right;
    }
  }

  #resize(length: number): void {
    this.end = this.start + length;
  }

  #updateTotals(): void {
    let x = this as Node;

    while (!x.isNIL) {
      x.#totalCharCount = x.left.totalCharCount + x.charCount +
        x.right.totalCharCount;

      x.#totalEolCount = x.left.totalEolCount + x.eolCount +
        x.right.totalEolCount;

      x = x.p;
    }
  }
}
