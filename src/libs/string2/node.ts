import { Buf } from "./buf.ts";
import { Slice } from "./slice.ts";

export class Node {
  readonly #buf: Buf;
  readonly #slice: Slice;

  #red: boolean;
  #p: Node;
  #left: Node;
  #right: Node;

  #totalCharCount: number;
  #totalEolCount: number;

  private constructor(
    nil: Node | undefined,
    buf: Buf,
    slice: Slice,
    red: boolean,
  ) {
    this.#buf = buf;
    this.#slice = slice;

    this.#red = red;
    this.#p = nil ?? this;
    this.#left = nil ?? this;
    this.#right = nil ?? this;

    this.#totalCharCount = slice.charCount;
    this.#totalEolCount = slice.eolCount;
  }

  static NIL = new Node(
    undefined,
    new Buf(""),
    new Slice(0, 0, 0, 0),
    false,
  );

  static create(buf: Buf, slice: Slice): Node {
    return new Node(Node.NIL, buf, slice, true);
  }

  clone(): Node {
    if (this.isNIL) {
      return this;
    }

    const node = new Node(Node.NIL, this.#buf, this.#slice.clone(), this.#red);

    node.#p = this.#p;
    node.#left = this.#left.clone();
    node.#right = this.#right.clone();

    node.#totalCharCount = this.#totalCharCount;
    node.#totalEolCount = this.#totalEolCount;

    return node;
  }

  *read(start: number, n: number): Generator<string> {
    let cur = this as Node;

    while (!cur.isNIL && (n > 0)) {
      const count = Math.min(cur.slice.charCount - start, n);
      const s = cur.slice.start + start;
      const e = s + count;

      yield cur.#buf.text.slice(s, e);

      start = 0;
      n -= count;

      cur = cur.successor();
    }
  }

  append(text: string): void {
    if (!this.isGrowable) {
      throw new Error("TreeNode is not growable");
    }

    this.#buf.append(text);

    this.resize(this.slice.charCount + text.length);
  }

  trimStart(n: number): void {
    this.slice.setStart(this.#buf, this.slice.start + n);

    this.#updateTotals();
  }

  trimEnd(n: number): void {
    this.resize(this.slice.charCount - n);
  }

  split(i: number): Node {
    const slice = this.slice.clone();
    slice.setStart(this.#buf, this.slice.start + i);

    this.resize(i);

    return Node.create(this.#buf, slice);
  }

  resize(length: number): void {
    this.slice.setEnd(this.#buf, this.slice.start + length);

    this.#updateTotals();
  }

  get isNIL(): boolean {
    return this === Node.NIL;
  }

  get isGrowable(): boolean {
    return this.#buf.isGrowable && (this.slice.end === this.#buf.text.length);
  }

  get red(): boolean {
    return this.#red;
  }

  set red(x: boolean) {
    this.#red = x;

    // TODO
    //this.#updateTotals();
  }

  get p(): Node {
    return this.#p;
  }

  set p(x: Node) {
    this.#p = x;

    //this.#updateTotals();
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

  get slice(): Slice {
    return this.#slice;
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

      if (eolIndex < x.slice.eolCount) {
        const eol_end = x.#buf.eols[x.slice.eolStart + eolIndex]!.end;
        return i + eol_end - x.slice.start;
      }

      eolIndex -= x.slice.eolCount;
      i += x.slice.charCount;
      x = x.right;
    }
  }

  #updateTotals(): void {
    let x = this as Node;

    while (!x.isNIL) {
      x.#totalCharCount = x.left.totalCharCount + x.slice.charCount +
        x.right.totalCharCount;

      x.#totalEolCount = x.left.totalEolCount + x.slice.eolCount +
        x.right.totalEolCount;

      x = x.p;
    }
  }
}
