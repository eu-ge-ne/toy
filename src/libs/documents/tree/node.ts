import { Slice } from "../slice.ts";

export const NIL = {
  nil: true,
  buf: Number.MAX_SAFE_INTEGER,

  red: false,

  totalLen: 0,
  totalEolsLen: 0,
} as TreeNode;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

export interface TreeNode {
  readonly nil: boolean;
  readonly buf: number;

  red: boolean;
  p: TreeNode;
  left: TreeNode;
  right: TreeNode;

  totalLen: number;
  totalEolsLen: number;

  sliceStart: number;
  sliceLen: number;
  eolSlice: Slice;
}

export function newTreeNode(
  buf: number,
  sliceStart: number,
  sliceLen: number,
  eolSlice: Slice,
): TreeNode {
  return {
    nil: false,
    buf,

    red: true,
    p: NIL,
    left: NIL,
    right: NIL,

    totalLen: sliceLen,
    totalEolsLen: eolSlice.length,

    sliceStart,
    sliceLen,
    eolSlice,
  };
}
