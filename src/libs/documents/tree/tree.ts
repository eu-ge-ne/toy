import { TreeNode } from "./node.ts";

export class Tree {
  root = TreeNode.NIL;

  find(charIndex: number): { node: TreeNode; offset: number } | undefined {
    let x = this.root;

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

  insertLeft(p: TreeNode, z: TreeNode): void {
    p.left = z;
    z.p = p;

    this.#insertFixup(z);
  }

  insertRight(p: TreeNode, z: TreeNode): void {
    p.right = z;
    z.p = p;

    this.#insertFixup(z);
  }

  insertBefore(p: TreeNode, z: TreeNode): void {
    if (p.left.nil) {
      this.insertLeft(p, z);
    } else {
      this.insertRight(this.#maximum(p.left), z);
    }
  }

  insertAfter(p: TreeNode, z: TreeNode): void {
    if (p.right.nil) {
      this.insertRight(p, z);
    } else {
      this.insertLeft(this.#minimum(p.right), z);
    }
  }

  #insertFixup(z: TreeNode): void {
    while (z.p.red) {
      if (z.p === z.p.p.left) {
        const y = z.p.p.right;
        if (y.red) {
          z.p.red = false;
          y.red = false;
          z.p.p.red = true;
          z = z.p.p;
        } else {
          if (z === z.p.right) {
            z = z.p;
            this.#leftRotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.#rightRotate(z.p.p);
        }
      } else {
        const y = z.p.p.left;
        if (y.red) {
          z.p.red = false;
          y.red = false;
          z.p.p.red = true;
          z = z.p.p;
        } else {
          if (z === z.p.left) {
            z = z.p;
            this.#rightRotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.#leftRotate(z.p.p);
        }
      }
    }

    this.root.red = false;

    TreeNode.updateDirty();
  }

  delete(z: TreeNode): void {
    let y = z;
    let y_original_color = y.red;
    let x: TreeNode;

    if (z.left.nil) {
      x = z.right;

      this.#transplant(z, z.right);
    } else if (z.right.nil) {
      x = z.left;

      this.#transplant(z, z.left);
    } else {
      y = this.#minimum(z.right);

      y_original_color = y.red;
      x = y.right;

      if (y !== z.right) {
        this.#transplant(y, y.right);

        y.right = z.right;
        y.right.p = y;
      } else {
        x.p = y;
      }

      this.#transplant(z, y);

      y.left = z.left;
      y.left.p = y;
      y.red = z.red;
    }

    if (!y_original_color) {
      this.#deleteFixup(x);
    }

    TreeNode.updateDirty();
  }

  #deleteFixup(x: TreeNode): void {
    while (x !== this.root && !x.red) {
      if (x === x.p.left) {
        let w = x.p.right;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.#leftRotate(x.p);
          w = x.p.right;
        }

        if (!w.left.red && !w.right.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.right.red) {
            w.left.red = false;
            w.red = true;
            this.#rightRotate(w);
            w = x.p.right;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.right.red = false;
          this.#leftRotate(x.p);
          x = this.root;
        }
      } else {
        let w = x.p.left;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.#rightRotate(x.p);
          w = x.p.left;
        }

        if (!w.right.red && !w.left.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.left.red) {
            w.right.red = false;
            w.red = true;
            this.#leftRotate(w);
            w = x.p.left;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.left.red = false;
          this.#rightRotate(x.p);
          x = this.root;
        }
      }
    }

    x.red = false;
  }

  #leftRotate(x: TreeNode): void {
    const y = x.right;

    x.right = y.left;
    if (!y.left.nil) {
      y.left.p = x;
    }

    y.p = x.p;

    if (x.p.nil) {
      this.root = y;
    } else if (x === x.p.left) {
      x.p.left = y;
    } else {
      x.p.right = y;
    }

    y.left = x;
    x.p = y;
  }

  #rightRotate(y: TreeNode): void {
    const x = y.left;

    y.left = x.right;
    if (!x.right.nil) {
      x.right.p = y;
    }

    x.p = y.p;

    if (y.p.nil) {
      this.root = x;
    } else if (y === y.p.left) {
      y.p.left = x;
    } else {
      y.p.right = x;
    }

    x.right = y;
    y.p = x;
  }

  #transplant(u: TreeNode, v: TreeNode): void {
    if (u.p.nil) {
      this.root = v;
    } else if (u === u.p.left) {
      u.p.left = v;
    } else {
      u.p.right = v;
    }

    v.p = u.p;
  }

  #minimum(x: TreeNode): TreeNode {
    while (!x.left.nil) {
      x = x.left;
    }

    return x;
  }

  #maximum(x: TreeNode): TreeNode {
    while (!x.right.nil) {
      x = x.right;
    }

    return x;
  }

  successor(x: TreeNode): TreeNode {
    if (!x.right.nil) {
      return this.#minimum(x.right);
    } else {
      let y = x.p;

      while (!y.nil && x === y.right) {
        x = y;
        y = y.p;
      }

      return y;
    }
  }
}
