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
  }

  get p(): TreeNode {
    return this.#p;
  }

  set p(x: TreeNode) {
    this.#p = x;
  }

  get left(): TreeNode {
    return this.#left;
  }

  set left(x: TreeNode) {
    this.#left = x;
  }

  get right(): TreeNode {
    return this.#right;
  }

  set right(x: TreeNode) {
    this.#right = x;
  }

  get sliceStart(): number {
    return this.#sliceStart;
  }

  set sliceStart(x: number) {
    this.#sliceStart = x;
  }

  get sliceLen(): number {
    return this.#sliceLen;
  }

  set sliceLen(x: number) {
    this.#sliceLen = x;
  }

  get eolSlice(): Slice {
    return this.#eolSlice;
  }

  set eolSlice(x: Slice) {
    this.#eolSlice = x;
  }

  get totalLen(): number {
    return this.#totalLen;
  }

  set totalLen(x: number) {
    this.#totalLen = x;
  }

  get totalEolsLen(): number {
    return this.#totalEolsLen;
  }

  set totalEolsLen(x: number) {
    this.#totalEolsLen = x;
  }
}
