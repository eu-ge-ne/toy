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
  eolsStart: number;
  eolsLen: number;
}

export function createNode(
  buf: number,
  sliceStart: number,
  sliceLen: number,
  eolsStart: number,
  eolsLen: number,
): TreeNode {
  return {
    nil: false,
    buf,

    red: true,
    p: NIL,
    left: NIL,
    right: NIL,
    totalLen: sliceLen,
    totalEolsLen: eolsLen,
    sliceStart,
    sliceLen,
    eolsStart,
    eolsLen,
  };
}

export function bubbleUpdate(x: TreeNode): void {
  while (!x.nil) {
    x.totalLen = x.left.totalLen + x.sliceLen + x.right.totalLen;

    x.totalEolsLen = x.left.totalEolsLen + x.eolsLen +
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
