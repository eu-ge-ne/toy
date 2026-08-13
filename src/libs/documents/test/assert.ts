import { assert, assertEquals } from "@std/assert";

import type { TreeNode } from "../node.ts";

export function assertGenerator(
  actual: Generator<string>,
  expected: string,
): void {
  assertEquals(actual.reduce((a, x) => a + x, ""), expected);
}

export function assertRoot(root: TreeNode): void {
  // 1. Every node is either red or black.
  // 2. The root is black.
  assert(!root.red);

  assertNode(root);

  // 5. For each node, all simple paths from the node to descendant leaves
  // contain the same number of black nodes.
  const leafs = new Set<TreeNode>();
  collectLeafs(root, leafs);

  const heights = Array.from(leafs).map((x) => {
    let height = 0;

    while (!x.p.isNIL) {
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

function assertNode(x: TreeNode): void {
  // 3. Every leaf (NIL) is black.
  if (x.isNIL) {
    assert(!x.red);
  } else {
    // 4. If a node is red, then both its children are black.
    if (x.red) {
      assert(!x.left.red && !x.right.red);
    }

    assertNode(x.left);
    assertNode(x.right);

    // 6. slice.charCount > 0
    assert(x.slice.charCount > 0);
  }
}

function collectLeafs(x: TreeNode, leaf_parents: Set<TreeNode>): void {
  if (!x.isNIL) {
    if (x.left.isNIL || x.right.isNIL) {
      leaf_parents.add(x);
    }

    collectLeafs(x.left, leaf_parents);
    collectLeafs(x.right, leaf_parents);
  }
}
