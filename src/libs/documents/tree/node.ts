import { Buf } from "../buf.ts";
import { Slice } from "../slice.ts";
import { Dirty } from "./dirty.ts";

export class TreeNode {
  readonly #dirty: Dirty;
  readonly #buf: Buf;
  readonly #slice: Slice;

  #red: boolean;
  #p: TreeNode;
  #left: TreeNode;
  #right: TreeNode;

  #totalLen: number;
  #totalEolsLen: number;

  private constructor(
    nil: TreeNode | undefined,
    dirty: Dirty,
    buf: Buf,
    slice: Slice,
    red: boolean,
  ) {
    this.#dirty = dirty;
    this.#buf = buf;
    this.#slice = slice;

    this.#red = red;
    this.#p = nil ?? this;
    this.#left = nil ?? this;
    this.#right = nil ?? this;

    this.#totalLen = slice.length;
    this.#totalEolsLen = slice.eolLength;
  }

  static create(dirty: Dirty, buf: Buf, slice: Slice): TreeNode {
    return new TreeNode(TreeNode.NIL, dirty, buf, slice, true);
  }

  static NIL = new TreeNode(
    undefined,
    new Dirty(),
    new Buf(""),
    new Slice(0, 0, 0, 0),
    false,
  );

  static createFromText(dirty: Dirty, text: string): TreeNode {
    const buf = new Buf(text);

    return TreeNode.create(dirty, buf, Slice.create(buf, 0, buf.text.length));
  }

  clone(): TreeNode {
    if (this.isNIL) {
      return this;
    }

    const x = new TreeNode(
      TreeNode.NIL,
      this.#dirty,
      this.#buf,
      this.#slice.clone(),
      this.#red,
    );

    x.#p = this.#p;
    x.#left = this.#left.clone();
    x.#right = this.#right.clone();

    x.#totalLen = this.#totalLen;
    x.#totalEolsLen = this.#totalEolsLen;

    return x;
  }

  *read(offsetInNode: number, n: number): Generator<string> {
    let x = this as TreeNode;

    while (!x.isNIL && (n > 0)) {
      const count = Math.min(x.slice.length - offsetInNode, n);

      yield x.#buf.text.slice(
        x.slice.start + offsetInNode,
        x.slice.start + offsetInNode + count,
      );

      x = x.successor();
      offsetInNode = 0;
      n -= count;
    }
  }

  append(text: string): void {
    if (!this.isGrowable) {
      throw new Error("node is not growable");
    }

    this.#buf.append(text);

    this.resize(this.slice.length + text.length);
  }

  trimStart(n: number): void {
    this.slice.setStart(this.#buf, this.slice.start + n);

    this.#dirty.add(this);
    this.#dirty.cleanup();
  }

  trimEnd(n: number): void {
    this.resize(this.slice.length - n);
  }

  split(offsetInNode: number): TreeNode {
    const slice = this.slice.clone();
    slice.setStart(this.#buf, this.slice.start + offsetInNode);

    this.resize(offsetInNode);

    return TreeNode.create(this.#dirty, this.#buf, slice);
  }

  resize(newLength: number): void {
    this.slice.setEnd(this.#buf, this.slice.start + newLength);

    this.#dirty.add(this);
    this.#dirty.cleanup();
  }

  updateTotals(): void {
    this.#totalLen = this.left.totalLen + this.slice.length +
      this.right.totalLen;

    this.#totalEolsLen = this.left.totalEolsLen + this.slice.eolLength +
      this.right.totalEolsLen;
  }

  get isNIL(): boolean {
    return this === TreeNode.NIL;
  }

  get isGrowable(): boolean {
    return (this.#buf.text.length < 100) &&
      (this.slice.end === this.#buf.text.length);
  }

  get red(): boolean {
    return this.#red;
  }

  set red(x: boolean) {
    this.#red = x;

    this.#dirty.add(this);
  }

  get p(): TreeNode {
    return this.#p;
  }

  set p(x: TreeNode) {
    this.#p = x;

    this.#dirty.add(this);
  }

  get left(): TreeNode {
    return this.#left;
  }

  set left(x: TreeNode) {
    this.#left = x;

    this.#dirty.add(this);
  }

  get right(): TreeNode {
    return this.#right;
  }

  set right(x: TreeNode) {
    this.#right = x;

    this.#dirty.add(this);
  }

  get slice(): Slice {
    return this.#slice;
  }

  get totalLen(): number {
    return this.#totalLen;
  }

  get totalEolsLen(): number {
    return this.#totalEolsLen;
  }

  minimum(): TreeNode {
    let x = this as TreeNode;
    while (!x.left.isNIL) {
      x = x.left;
    }
    return x;
  }

  maximum(): TreeNode {
    let x = this as TreeNode;
    while (!x.right.isNIL) {
      x = x.right;
    }
    return x;
  }

  successor(): TreeNode {
    let x = this as TreeNode;

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
    let x = this as TreeNode;
    let i = 0;

    while (!x.isNIL) {
      if (eolIndex < x.left.totalEolsLen) {
        x = x.left;
        continue;
      }

      eolIndex -= x.left.totalEolsLen;
      i += x.left.totalLen;

      if (eolIndex < x.slice.eolLength) {
        const eol_end = x.#buf.eols[x.slice.eolStart + eolIndex]!.end;
        return i + eol_end - x.slice.start;
      }

      eolIndex -= x.slice.eolLength;
      i += x.slice.length;
      x = x.right;
    }
  }
}
