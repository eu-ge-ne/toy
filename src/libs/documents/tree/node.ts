import { Slice } from "../slice.ts";

export class TreeNode {
  #buf: number;
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
    buf: number,
    red: boolean,
    slice: Slice,
    eolSlice: Slice,
  ) {
    this.#buf = buf;
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

  static create(buf: number, slice: Slice, eolSlice: Slice): TreeNode {
    return new TreeNode(TreeNode.NIL, buf, true, slice, eolSlice);
  }

  clone(): TreeNode {
    if (this.nil) {
      return this;
    }

    const x = new TreeNode(
      TreeNode.NIL,
      this.#buf,
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

      while (!x.nil) {
        x.#totalLen = x.left.totalLen + x.slice.length + x.right.totalLen;

        x.#totalEolsLen = x.left.totalEolsLen + x.eolSlice.length +
          x.right.totalEolsLen;

        x = x.p;

        TreeNode.DIRTY.delete(x);
      }
    }
  }

  get nil(): boolean {
    return this === TreeNode.NIL;
  }

  get buf(): number {
    return this.#buf;
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

    while (!x.left.nil) {
      x = x.left;
    }

    return x;
  }

  maximum(): TreeNode {
    let x = this as TreeNode;

    while (!x.right.nil) {
      x = x.right;
    }

    return x;
  }

  successor(): TreeNode {
    let x = this as TreeNode;

    if (!x.right.nil) {
      return this.right.minimum();
    } else {
      let y = x.p;

      while (!y.nil && x === y.right) {
        x = y;
        y = y.p;
      }

      return y;
    }
  }

  #setDirty(): void {
    if (!this.nil) {
      TreeNode.DIRTY.add(this);
    }
  }
}
