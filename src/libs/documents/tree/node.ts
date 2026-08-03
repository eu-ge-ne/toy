import { Slice } from "../slice.ts";

export class TreeNode {
  p: TreeNode;
  left: TreeNode;
  right: TreeNode;

  totalLen: number;
  totalEolsLen: number;

  private constructor(
    public buf: number,
    public red: boolean,
    public sliceStart: number,
    public sliceLen: number,
    public eolSlice: Slice,
    nil?: TreeNode,
  ) {
    this.p = nil ?? this;
    this.left = nil ?? this;
    this.right = nil ?? this;

    this.totalLen = sliceLen;
    this.totalEolsLen = eolSlice.length;
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
      this.buf,
      this.red,
      this.sliceStart,
      this.sliceLen,
      this.eolSlice,
      TreeNode.NIL,
    );

    x.p = this.p;
    x.left = this.left.clone();
    x.right = this.right.clone();

    x.totalLen = this.totalLen;
    x.totalEolsLen = this.totalEolsLen;

    return x;
  }

  get nil(): boolean {
    return this === TreeNode.NIL;
  }
}
