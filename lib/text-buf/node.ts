export const NIL = {
  nil: true,
  red: false,
  total_len: 0,
  total_eols_len: 0,
} as Node;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

/**
 * @ignore
 */
export interface Node {
  nil: boolean;
  red: boolean;
  p: Node;
  left: Node;
  right: Node;
  total_len: number;
  total_eols_len: number;
  buf: number;
  slice_start: number;
  slice_len: number;
  eols_start: number;
  eols_len: number;
}

export function create(
  buf: number,
  slice_start: number,
  slice_len: number,
  eols_start: number,
  eols_len: number,
): Node {
  return {
    nil: false,
    red: true,
    p: NIL,
    left: NIL,
    right: NIL,
    total_len: slice_len,
    total_eols_len: eols_len,
    buf,
    slice_start,
    slice_len,
    eols_start,
    eols_len,
  };
}

export function find(
  x: Node,
  index: number,
): { node: Node; offset: number } | undefined {
  while (!x.nil) {
    if (index < x.left.total_len) {
      x = x.left;
      continue;
    }

    index -= x.left.total_len;

    if (index < x.slice_len) {
      return { node: x, offset: index };
    }

    index -= x.slice_len;
    x = x.right;
  }
}

export function bubble(x: Node): void {
  while (!x.nil) {
    x.total_len = x.left.total_len + x.slice_len + x.right.total_len;

    x.total_eols_len = x.left.total_eols_len + x.eols_len +
      x.right.total_eols_len;

    x = x.p;
  }
}

export function minimum(x: Node): Node {
  while (!x.left.nil) {
    x = x.left;
  }

  return x;
}

export function maximum(x: Node): Node {
  while (!x.right.nil) {
    x = x.right;
  }

  return x;
}

export function successor(x: Node): Node {
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
