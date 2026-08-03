import { Slice } from "../slice.ts";
import { TextBuffer } from "../text-buffer.ts";

export class TreeNode {
  readonly #bufIndex: number;
  #red: boolean;

  #p: TreeNode;
  #left: TreeNode;
  #right: TreeNode;

  #slice: Slice;
  #eolSlice: Slice;

  #totalLen: number;
  #totalEolsLen: number;

  private constructor(
    nil: TreeNode | undefined,
    bufIndex: number,
    red: boolean,
    slice: Slice,
    eolSlice: Slice,
  ) {
    this.#bufIndex = bufIndex;
    this.#red = red;

    this.#p = nil ?? this;
    this.#left = nil ?? this;
    this.#right = nil ?? this;

    this.#slice = slice;
    this.#eolSlice = eolSlice;

    this.#totalLen = slice.length;
    this.#totalEolsLen = eolSlice.length;
  }

  static NIL = new TreeNode(
    undefined,
    Number.MAX_SAFE_INTEGER,
    false,
    new Slice(0, 0),
    new Slice(0, 0),
  );

  private static DIRTY = new Set<TreeNode>();

  static createFromText(bufs: TextBuffer[], text: string): TreeNode {
    const buf = new TextBuffer(text);
    const i = bufs.push(buf) - 1;

    return TreeNode.createFromSlice(
      i,
      new Slice(0, buf.text.length),
      new Slice(0, buf.eols.length),
    );
  }

  static createFromSlice(
    bufIndex: number,
    slice: Slice,
    eolSlice: Slice,
  ): TreeNode {
    return new TreeNode(TreeNode.NIL, bufIndex, true, slice, eolSlice);
  }

  clone(): TreeNode {
    if (this.isNIL) {
      return this;
    }

    const x = new TreeNode(
      TreeNode.NIL,
      this.#bufIndex,
      this.#red,
      this.#slice,
      this.#eolSlice,
    );

    x.#p = this.#p;
    x.#left = this.#left.clone();
    x.#right = this.#right.clone();

    x.#totalLen = this.#totalLen;
    x.#totalEolsLen = this.#totalEolsLen;

    return x;
  }

  static updateDirty(): void {
    while (true) {
      let x = TreeNode.DIRTY.keys().next().value;
      if (!x) {
        return;
      }

      TreeNode.DIRTY.delete(x);

      while (!x.isNIL) {
        x.#totalLen = x.left.totalLen + x.slice.length + x.right.totalLen;

        x.#totalEolsLen = x.left.totalEolsLen + x.eolSlice.length +
          x.right.totalEolsLen;

        x = x.p;

        TreeNode.DIRTY.delete(x);
      }
    }
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

  set slice(x: Slice) {
    this.#slice = x;
    this.#setDirty();
  }

  get eolSlice(): Slice {
    return this.#eolSlice;
  }

  set eolSlice(x: Slice) {
    this.#eolSlice = x;
    this.#setDirty();
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

  #setDirty(): void {
    if (!this.isNIL) {
      TreeNode.DIRTY.add(this);
    }
  }
}
