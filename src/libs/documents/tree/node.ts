import { Buf } from "../buf.ts";
import { Slice } from "../slice.ts";

export class TreeNode {
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

    this.#totalLen = slice.length;
    this.#totalEolsLen = slice.eolLength;
  }

  static create(buf: Buf, slice: Slice): TreeNode {
    return new TreeNode(TreeNode.NIL, buf, slice, true);
  }

  static NIL = new TreeNode(
    undefined,
    new Buf(""),
    new Slice(0, 0, 0, 0),
    false,
  );

  static #DIRTY = new Set<TreeNode>();

  #setDirty(): void {
    if (!this.isNIL) {
      TreeNode.#DIRTY.add(this);
    }
  }

  static createFromText(text: string): TreeNode {
    const buf = new Buf(text);

    return TreeNode.create(buf, Slice.create(buf, 0, buf.text.length));
  }

  static updateDirty(): void {
    while (true) {
      let x = TreeNode.#DIRTY.keys().next().value;
      if (!x) {
        return;
      }

      TreeNode.#DIRTY.delete(x);

      while (!x.isNIL) {
        x.#totalLen = x.left.totalLen + x.slice.length + x.right.totalLen;

        x.#totalEolsLen = x.left.totalEolsLen + x.slice.eolLength +
          x.right.totalEolsLen;

        x = x.p;

        TreeNode.#DIRTY.delete(x);
      }
    }
  }

  clone(): TreeNode {
    if (this.isNIL) {
      return this;
    }

    const x = new TreeNode(
      TreeNode.NIL,
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
    this.#setDirty();

    TreeNode.updateDirty();
  }

  trimEnd(n: number): void {
    this.resize(this.slice.length - n);
  }

  split(offsetInNode: number): TreeNode {
    const slice = this.slice.clone();
    slice.setStart(this.#buf, this.slice.start + offsetInNode);

    this.resize(offsetInNode);

    return TreeNode.create(this.#buf, slice);
  }

  resize(newLength: number): void {
    this.slice.setEnd(this.#buf, this.slice.start + newLength);
    this.#setDirty();

    TreeNode.updateDirty();
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
    this.#setDirty();
  }

  get p(): TreeNode {
    return this.#p;
  }

  set p(x: TreeNode) {
    this.#p = x;
    this.#setDirty();
  }

  get left(): TreeNode {
    return this.#left;
  }

  set left(x: TreeNode) {
    this.#left = x;
    this.#setDirty();
  }

  get right(): TreeNode {
    return this.#right;
  }

  set right(x: TreeNode) {
    this.#right = x;
    this.#setDirty();
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
