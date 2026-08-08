import { Buf } from "../buf.ts";
import { Slice } from "../slice.ts";

export class TreeNode {
  readonly #bufIndex: number;
  #red: boolean;

  #p: TreeNode;
  #left: TreeNode;
  #right: TreeNode;

  #slice: Slice;

  #totalLen: number;
  #totalEolsLen: number;

  private constructor(
    nil: TreeNode | undefined,
    bufIndex: number,
    red: boolean,
    slice: Slice,
  ) {
    this.#bufIndex = bufIndex;
    this.#red = red;

    this.#p = nil ?? this;
    this.#left = nil ?? this;
    this.#right = nil ?? this;

    this.#slice = slice;

    this.#totalLen = slice.length;
    this.#totalEolsLen = slice.eolLength;
  }

  static NIL = new TreeNode(
    undefined,
    Number.MAX_SAFE_INTEGER,
    false,
    new Slice(0, 0, 0, 0),
  );

  static #DIRTY = new Set<TreeNode>();

  #setDirty(): void {
    if (!this.isNIL) {
      TreeNode.#DIRTY.add(this);
    }
  }

  static createFromText(bufs: Buf[], text: string): TreeNode {
    const buf = new Buf(text);
    const i = bufs.push(buf) - 1;

    return TreeNode.createFromSlice(i, Slice.create(buf, 0, buf.text.length));
  }

  static createFromSlice(bufIndex: number, slice: Slice): TreeNode {
    return new TreeNode(TreeNode.NIL, bufIndex, true, slice);
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
      this.#bufIndex,
      this.#red,
      this.#slice.clone(),
    );

    x.#p = this.#p;
    x.#left = this.#left.clone();
    x.#right = this.#right.clone();

    x.#totalLen = this.#totalLen;
    x.#totalEolsLen = this.#totalEolsLen;

    return x;
  }

  *read(bufs: Buf[], offsetInNode: number, n: number): Generator<string> {
    let x = this as TreeNode;

    while (!x.isNIL && (n > 0)) {
      const count = Math.min(x.slice.length - offsetInNode, n);

      yield bufs[x.bufIndex]!.text.slice(
        x.slice.start + offsetInNode,
        x.slice.start + offsetInNode + count,
      );

      x = x.successor();
      offsetInNode = 0;
      n -= count;
    }
  }

  isGrowable(bufs: Buf[]): boolean {
    const buf = bufs[this.bufIndex]!;

    return (buf.text.length < 100) && (this.slice.end === buf.text.length);
  }

  append(bufs: Buf[], text: string): void {
    bufs[this.bufIndex]!.append(text);

    this.resize(bufs, this.slice.length + text.length);
  }

  trimStart(bufs: Buf[], n: number): void {
    const buf = bufs[this.bufIndex]!;

    this.slice.setStart(buf, this.slice.start + n);
    this.#setDirty();

    TreeNode.updateDirty();
  }

  trimEnd(bufs: Buf[], n: number): void {
    this.resize(bufs, this.slice.length - n);
  }

  split(bufs: Buf[], offsetInNode: number): TreeNode {
    const buf = bufs[this.bufIndex]!;

    const slice = this.slice.clone();
    slice.setStart(buf, this.slice.start + offsetInNode);

    this.resize(bufs, offsetInNode);

    return TreeNode.createFromSlice(this.bufIndex, slice);
  }

  resize(bufs: Buf[], newLen: number): void {
    const buf = bufs[this.bufIndex]!;

    this.slice.setEnd(buf, this.slice.start + newLen);
    this.#setDirty();

    TreeNode.updateDirty();
  }

  get isNIL(): boolean {
    return this === TreeNode.NIL;
  }

  get bufIndex(): number {
    return this.#bufIndex;
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
}
