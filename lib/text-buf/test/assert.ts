import { assert, assertEquals } from "@std/assert";

import type { Node } from "../node.ts";

export function assert_generator(
  actual: Generator<string>,
  expected: string,
): void {
  assertEquals(actual.reduce((a, x) => a + x, ""), expected);
}

export function assert_root(root: Node): void {
  // 1. Every node is either red or black.
  // 2. The root is black.
  assert(!root.red);

  assert_node(root);

  // 5. For each node, all simple paths from the node to descendant leaves
  // contain the same number of black nodes.
  const leafs = new Set<Node>();
  collect_leafs(root, leafs);

  const heights = Array.from(leafs).map((x) => {
    let height = 0;

    while (!x.p.nil) {
      if (!x.red) {
        height += 1;
      }
      x = x.p;
    }

    return height;
  });

  for (const height of heights) {
    assertEquals(heights[0], height);
  }
}

function assert_node(x: Node): void {
  // 3. Every leaf (NIL) is black.
  if (x.nil) {
    assert(!x.red);
  } else {
    // 4. If a node is red, then both its children are black.
    if (x.red) {
      assert(!x.left.red && !x.right.red);
    }

    assert_node(x.left);
    assert_node(x.right);

    // 6. slice_len > 0
    assert(x.slice_len > 0);
  }
}

function collect_leafs(x: Node, leaf_parents: Set<Node>): void {
  if (!x.nil) {
    if (x.left.nil || x.right.nil) {
      leaf_parents.add(x);
    }

    collect_leafs(x.left, leaf_parents);
    collect_leafs(x.right, leaf_parents);
  }
}
