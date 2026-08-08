import { TreeNode } from "./node.ts";

export class Dirty {
  #set = new Set<TreeNode>();

  add(node: TreeNode): void {
    if (node.isNIL) {
      return;
    }

    this.#set.add(node);
  }

  cleanup(): void {
    while (true) {
      let node = this.#set.keys().next().value;
      if (!node) {
        return;
      }

      this.#set.delete(node);

      while (!node.isNIL) {
        node.updateTotals();

        node = node.p;

        this.#set.delete(node);
      }
    }
  }
}
