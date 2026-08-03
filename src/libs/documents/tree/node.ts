import { Slice } from "../slice.ts";

export class TreeNode {
  #buf: number;
  #red: boolean;

  #p: TreeNode;
  #left: TreeNode;
  #right: TreeNode;

  #sliceStart: number;
  #sliceLen: number;
  #eolSlice: Slice;

  #totalLen: number;
  #totalEolsLen: number;

  private constructor(
    buf: number,
    red: boolean,
    sliceStart: number,
    sliceLen: number,
    eolSlice: Slice,
    nil?: TreeNode,
  ) {
    this.#buf = buf;
    this.#red = red;

    this.#p = nil ?? this;
    this.#left = nil ?? this;
    this.#right = nil ?? this;

    this.#sliceStart = sliceStart;
    this.#sliceLen = sliceLen;
    this.#eolSlice = eolSlice;

    this.#totalLen = sliceLen;
    this.#totalEolsLen = eolSlice.length;
  }

  static NIL = new TreeNode(
    Number.MAX_SAFE_INTEGER,
    false,
    0,
    0,
    new Slice(0, 0),
  );

  private static dirty = new Set<TreeNode>();

  static create(
    buf: number,
    sliceStart: number,
    sliceLen: number,
    eolSlice: Slice,
  ): TreeNode {
    return new TreeNode(
      buf,
      true,
      sliceStart,
      sliceLen,
      eolSlice,
      TreeNode.NIL,
    );
  }

  clone(): TreeNode {
    if (this.nil) {
      return this;
    }

    const x = new TreeNode(
      this.#buf,
      this.#red,
      this.#sliceStart,
      this.#sliceLen,
      this.#eolSlice,
      TreeNode.NIL,
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
      let x = TreeNode.dirty.keys().next().value;
      if (!x) {
        return;
      }

      TreeNode.dirty.delete(x);

      while (!x.nil) {
        x.#totalLen = x.left.totalLen + x.sliceLen + x.right.totalLen;

        x.#totalEolsLen = x.left.totalEolsLen + x.eolSlice.length +
          x.right.totalEolsLen;

        x = x.p;

        TreeNode.dirty.delete(x);
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
    TreeNode.dirty.add(this);
  }

  get p(): TreeNode {
    return this.#p;
  }

  set p(x: TreeNode) {
    this.#p = x;
    TreeNode.dirty.add(this);
  }

  get left(): TreeNode {
    return this.#left;
  }

  set left(x: TreeNode) {
    this.#left = x;
    TreeNode.dirty.add(this);
  }

  get right(): TreeNode {
    return this.#right;
  }

  set right(x: TreeNode) {
    this.#right = x;
    TreeNode.dirty.add(this);
  }

  get sliceStart(): number {
    return this.#sliceStart;
  }

  set sliceStart(x: number) {
    this.#sliceStart = x;
    TreeNode.dirty.add(this);
  }

  get sliceLen(): number {
    return this.#sliceLen;
  }

  set sliceLen(x: number) {
    this.#sliceLen = x;
    TreeNode.dirty.add(this);
  }

  get eolSlice(): Slice {
    return this.#eolSlice;
  }

  set eolSlice(x: Slice) {
    this.#eolSlice = x;
    TreeNode.dirty.add(this);
  }

  get totalLen(): number {
    return this.#totalLen;
  }

  set totalLen(x: number) {
    this.#totalLen = x;
    TreeNode.dirty.add(this);
  }

  get totalEolsLen(): number {
    return this.#totalEolsLen;
  }

  set totalEolsLen(x: number) {
    this.#totalEolsLen = x;
    TreeNode.dirty.add(this);
  }
}
