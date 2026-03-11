import { Content } from "./content.ts";
import { bubble, find, NIL, type Node, successor } from "./node.ts";
import { Tree } from "./tree.ts";

export const enum InsertionCase {
  Root,
  Left,
  Right,
  Split,
}

export class TextBuf {
  tree: Tree = new Tree();

  #content = new Content();

  constructor(text?: string) {
    if (text && text.length > 0) {
      this.tree.root = this.#content.create(text);
      this.tree.root.red = false;
    }
  }

  get charCount(): number {
    return this.tree.root.total_len;
  }

  get lineCount(): number {
    return this.tree.root.total_len === 0
      ? 0
      : this.tree.root.total_eols_len + 1;
  }

  save(): Node {
    return structuredClone(this.tree.root);
  }

  restore(node: Node): void {
    this.tree.root = structuredClone(node);
  }

  text(): string {
    return this.read(0).reduce((a, x) => a + x, "");
  }

  *read(start: number, end = Number.MAX_SAFE_INTEGER): Generator<string> {
    const first = find(this.tree.root, start);
    if (!first) {
      return;
    }

    const { node, offset } = first;

    yield* this.#content.read(node, offset, end - start);
  }

  /**
   * Returns text in the buffer's section, specified by start (inclusive) and end (exclusive) positions.
   *
   * @param `start` Start position.
   * @param `end` Optional end position.
   * @returns Text.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@lib/text-buf";
   *
   * const buf = new TextBuf("Lorem\nipsum");
   *
   * assertEquals(buf.read2([0, 0], [1, 0]).toArray().join(""), "Lorem\n");
   * assertEquals(buf.read2([1, 0], [2, 0]).toArray().join(""), "ipsum");
   * ```
   */
  *read2(start: [number, number], end?: [number, number]): Generator<string> {
    const i = this.#pos_to_index(start);
    if (typeof i !== "number") {
      return;
    }

    yield* this.read(i, this.#pos_to_index(end));
  }

  /**
   * Inserts text into the buffer at the specified index.
   *
   * @param `i` Index at witch to insert the text
   * @param `text` Text to insert
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@lib/text-buf";
   *
   * const buf = new TextBuf();
   *
   * buf.insert(0, "Lorem");
   * buf.insert(5, " ipsum");
   *
   * assertEquals(buf.read(0).toArray().join(""), "Lorem ipsum");
   * ```
   */
  insert(i: number, text: string): void {
    if (i > this.charCount) {
      return;
    }

    let insert_case = InsertionCase.Root;
    let p = NIL;
    let x = this.tree.root;

    while (!x.nil) {
      if (i <= x.left.total_len) {
        insert_case = InsertionCase.Left;
        p = x;
        x = x.left;
        continue;
      }

      i -= x.left.total_len;

      if (i < x.slice_len) {
        insert_case = InsertionCase.Split;
        p = x;
        x = NIL;
        continue;
      }

      i -= x.slice_len;

      insert_case = InsertionCase.Right;
      p = x;
      x = x.right;
    }

    if (insert_case === InsertionCase.Right && this.#content.growable(p)) {
      this.#content.grow(p, text);
      bubble(p);
      return;
    }

    const child = this.#content.create(text);

    switch (insert_case) {
      case InsertionCase.Root: {
        this.tree.root = child;
        this.tree.root.red = false;
        break;
      }
      case InsertionCase.Left: {
        this.tree.insert_left(p, child);
        break;
      }
      case InsertionCase.Right: {
        this.tree.insert_right(p, child);
        break;
      }
      case InsertionCase.Split: {
        const y = this.#content.split(p, i, 0);
        this.tree.insert_after(p, y);
        this.tree.insert_before(y, child);
        break;
      }
    }
  }

  /**
   * Inserts text into the buffer at the specified position.
   *
   * @param `pos` Position at witch to insert the text
   * @param `text` Text to insert
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@lib/text-buf";
   *
   * const buf = new TextBuf();
   *
   * buf.insert2([0, 0], "Lorem");
   * buf.insert2([0, 5], " ipsum");
   *
   * assertEquals(buf.read(0).toArray().join(""), "Lorem ipsum");
   * ```
   */
  insert2(pos: [number, number], text: string): void {
    const i = this.#pos_to_index(pos);
    if (typeof i !== "number") {
      return;
    }

    this.insert(i, text);
  }

  /**
   * Appends text to the buffer
   *
   * @param `text` Text to append
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@lib/text-buf";
   *
   * const buf = new TextBuf();
   *
   * buf.insert(0, "Lorem");
   * buf.append(" ipsum");
   *
   * assertEquals(buf.read(0).toArray().join(""), "Lorem ipsum");
   * ```
   */
  append(text: string): void {
    this.insert(this.charCount, text);
  }

  /**
   * Resets the buffer
   *
   * @param `text` Text to insert
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@lib/text-buf";
   *
   * const buf = new TextBuf();
   *
   * buf.insert(0, "Lorem");
   * buf.reset();
   *
   * assertEquals(buf.read(0).toArray().join(""), "");
   * ```
   */
  reset(text?: string): void {
    this.delete(0);

    if (typeof text === "string") {
      this.insert(0, text);
    }
  }

  /**
   * Removes characters in the buffer's section, specified by start (inclusive) and end (exclusive) indexes.
   *
   * @param `start` Start index.
   * @param `end` Optional end index.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@lib/text-buf";
   *
   * const buf = new TextBuf("Lorem ipsum");
   *
   * buf.delete(5, 11);
   *
   * assertEquals(buf.read(0).toArray().join(""), "Lorem");
   * ```
   */
  delete(start: number, end = Number.MAX_SAFE_INTEGER): void {
    const first = find(this.tree.root, start);
    if (!first) {
      return;
    }

    const { node, offset } = first;
    const count = end - start;
    const offset2 = offset + count;

    if (offset2 === node.slice_len) {
      if (offset === 0) {
        this.tree.delete(node);
      } else {
        this.#content.trim_end(node, count);
        bubble(node);
      }
    } else if (offset2 < node.slice_len) {
      if (offset === 0) {
        this.#content.trim_start(node, count);
        bubble(node);
      } else {
        const y = this.#content.split(node, offset, count);
        this.tree.insert_after(node, y);
      }
    } else {
      let x = node;
      let i = 0;

      if (offset !== 0) {
        x = this.#content.split(node, offset, 0);
        this.tree.insert_after(node, x);
      }

      const last = find(this.tree.root, end);
      if (last && last.offset !== 0) {
        const y = this.#content.split(last.node, last.offset, 0);
        this.tree.insert_after(last.node, y);
      }

      while (!x.nil && (i < count)) {
        i += x.slice_len;

        const next = successor(x);

        this.tree.delete(x);

        x = next;
      }
    }
  }

  /**
   * Removes characters in the buffer's section, specified by start (inclusive) and end (exclusive) positions.
   *
   * @param `start` Start position.
   * @param `end` Optional end position.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@lib/text-buf";
   *
   * const buf = new TextBuf("Lorem ipsum");
   *
   * buf.delete2([0, 5], [0, 11]);
   *
   * assertEquals(buf.read(0).toArray().join(""), "Lorem");
   * ```
   */
  delete2(start: [number, number], end?: [number, number]): void {
    const i = this.#pos_to_index(start);
    if (typeof i !== "number") {
      return;
    }

    this.delete(i, this.#pos_to_index(end));
  }

  #pos_to_index(pos?: [number, number]): number | undefined {
    if (!pos) {
      return;
    }

    const i = this.#find_line_start(pos[0]);
    if (typeof i !== "number") {
      return;
    }

    return i + pos[1];
  }

  #find_line_start(ln: number): number | undefined {
    if (ln === 0) {
      return 0;
    }

    let eol_index = ln - 1;
    let x = this.tree.root;
    let i = 0;

    while (!x.nil) {
      if (eol_index < x.left.total_eols_len) {
        x = x.left;
        continue;
      }

      eol_index -= x.left.total_eols_len;
      i += x.left.total_len;

      if (eol_index < x.eols_len) {
        const buf = this.#content.buffers[x.buf]!;
        const eol_end = buf.get_eol_end(x.eols_start + eol_index)!;
        return i + eol_end - x.slice_start;
      }

      eol_index -= x.eols_len;
      i += x.slice_len;
      x = x.right;
    }
  }
}
