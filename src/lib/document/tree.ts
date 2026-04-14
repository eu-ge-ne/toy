import { bubble, maximum, minimum, NIL, type Node } from "./node.ts";

export class Tree {
  root = NIL;

  insert_left(p: Node, z: Node): void {
    p.left = z;
    z.p = p;

    bubble(z);

    this.#insert_fixup(z);
  }

  insert_right(p: Node, z: Node): void {
    p.right = z;
    z.p = p;

    bubble(z);

    this.#insert_fixup(z);
  }

  insert_before(p: Node, z: Node): void {
    if (p.left.nil) {
      this.insert_left(p, z);
    } else {
      this.insert_right(maximum(p.left), z);
    }
  }

  insert_after(p: Node, z: Node): void {
    if (p.right.nil) {
      this.insert_right(p, z);
    } else {
      this.insert_left(minimum(p.right), z);
    }
  }

  #insert_fixup(z: Node): void {
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
            this.#left_rotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.#right_rotate(z.p.p);
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
            this.#right_rotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.#left_rotate(z.p.p);
        }
      }
    }

    this.root.red = false;
  }

  delete(z: Node): void {
    let y = z;
    let y_original_color = y.red;
    let x: Node;

    if (z.left.nil) {
      x = z.right;

      this.#transplant(z, z.right);
      bubble(z.right.p);
    } else if (z.right.nil) {
      x = z.left;

      this.#transplant(z, z.left);
      bubble(z.left.p);
    } else {
      y = minimum(z.right);

      y_original_color = y.red;
      x = y.right;

      if (y !== z.right) {
        this.#transplant(y, y.right);
        bubble(y.right.p);

        y.right = z.right;
        y.right.p = y;
      } else {
        x.p = y;
      }

      this.#transplant(z, y);

      y.left = z.left;
      y.left.p = y;
      y.red = z.red;

      bubble(y);
    }

    if (!y_original_color) {
      this.#delete_fixup(x);
    }
  }

  #delete_fixup(x: Node): void {
    while (x !== this.root && !x.red) {
      if (x === x.p.left) {
        let w = x.p.right;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.#left_rotate(x.p);
          w = x.p.right;
        }

        if (!w.left.red && !w.right.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.right.red) {
            w.left.red = false;
            w.red = true;
            this.#right_rotate(w);
            w = x.p.right;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.right.red = false;
          this.#left_rotate(x.p);
          x = this.root;
        }
      } else {
        let w = x.p.left;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.#right_rotate(x.p);
          w = x.p.left;
        }

        if (!w.right.red && !w.left.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.left.red) {
            w.right.red = false;
            w.red = true;
            this.#left_rotate(w);
            w = x.p.left;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.left.red = false;
          this.#right_rotate(x.p);
          x = this.root;
        }
      }
    }

    x.red = false;
  }

  #left_rotate(x: Node): void {
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

    bubble(x);
  }

  #right_rotate(y: Node): void {
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

    bubble(y);
  }

  #transplant(u: Node, v: Node): void {
    if (u.p.nil) {
      this.root = v;
    } else if (u === u.p.left) {
      u.p.left = v;
    } else {
      u.p.right = v;
    }

    v.p = u.p;
  }
}
