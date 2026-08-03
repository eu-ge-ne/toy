export const NIL = {
  nil: true,
  red: false,
  total_len: 0,
  total_eols_len: 0,
} as TreeNode;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

export class TreeNode {
  nil = false;
  red = true;
  p = NIL;
  left = NIL;
  right = NIL;
  total_len: number;
  total_eols_len: number;
  buf: number;
  slice_start: number;
  slice_len: number;
  eols_start: number;
  eols_len: number;

  constructor(
    buf: number,
    slice_start: number,
    slice_len: number,
    eols_start: number,
    eols_len: number,
  ) {
    this.total_len = slice_len;
    this.total_eols_len = eols_len;
    this.buf = buf;
    this.slice_start = slice_start;
    this.slice_len = slice_len;
    this.eols_start = eols_start;
    this.eols_len = eols_len;
  }
}

export function bubbleUpdate(x: TreeNode): void {
  while (!x.nil) {
    x.total_len = x.left.total_len + x.slice_len + x.right.total_len;

    x.total_eols_len = x.left.total_eols_len + x.eols_len +
      x.right.total_eols_len;

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
