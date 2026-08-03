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

export function create(
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

export function find(
  x: TreeNode,
  charIndex: number,
): { node: TreeNode; offset: number } | undefined {
  while (!x.nil) {
    if (charIndex < x.left.totalLen) {
      x = x.left;
      continue;
    }

    charIndex -= x.left.totalLen;

    if (charIndex < x.sliceLen) {
      return { node: x, offset: charIndex };
    }

    charIndex -= x.sliceLen;
    x = x.right;
  }
}

export function bubbleUpdate(x: TreeNode): void {
  while (!x.nil) {
    x.totalLen = x.left.totalLen + x.sliceLen + x.right.totalLen;

    x.totalEolsLen = x.left.totalEolsLen + x.eolSlice.length +
      x.right.totalEolsLen;

    x = x.p;
  }
}

export function minimum(x: TreeNode): TreeNode {
  while (!x.left.nil) {
    x = x.left;
  }

  return x;
}

export function maximum(x: TreeNode): TreeNode {
  while (!x.right.nil) {
    x = x.right;
  }

  return x;
}

export function successor(x: TreeNode): TreeNode {
  if (!x.right.nil) {
    return minimum(x.right);
  } else {
    let y = x.p;

    while (!y.nil && x === y.right) {
      x = y;
      y = y.p;
    }

    return y;
  }
}
