import { TextBuffer } from "./text-buffer.ts";
import { bubble, find, NIL, successor, TreeNode } from "./tree/node.ts";
import { Tree } from "./tree/tree.ts";

export const enum InsertionCase {
  Root,
  Left,
  Right,
  Split,
}

export class Document {
  readonly tree: Tree = new Tree();
  readonly #bufs: TextBuffer[] = [];

  constructor(text?: string) {
    if (text && text.length > 0) {
      this.tree.root = this.#createNode(text);
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

  *read(start: number, end = Number.MAX_SAFE_INTEGER): Generator<string> {
    const first = find(this.tree.root, start);
    if (!first) {
      return;
    }

    const { node, offset } = first;

    yield* this.#readNode(node, offset, end - start);
  }

  *read2(start: [number, number], end?: [number, number]): Generator<string> {
    const i = this.#posToIndex(start);
    if (typeof i !== "number") {
      return;
    }

    yield* this.read(i, this.#posToIndex(end));
  }

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

    if (insert_case === InsertionCase.Right && this.#isNodeGrowable(p)) {
      this.#growNode(p, text);
      bubble(p);
      return;
    }

    const child = this.#createNode(text);

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
        const y = this.#splitNode(p, i, 0);
        this.tree.insert_after(p, y);
        this.tree.insert_before(y, child);
        break;
      }
    }
  }

  insert2(pos: [number, number], text: string): void {
    const i = this.#posToIndex(pos);
    if (typeof i !== "number") {
      return;
    }

    this.insert(i, text);
  }

  async load(data: AsyncIterable<string>): Promise<void> {
    this.delete(0);

    for await (const chunk of data) {
      this.insert(this.charCount, chunk);
    }
  }

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
        this.#trimNodeEnd(node, count);
        bubble(node);
      }
    } else if (offset2 < node.slice_len) {
      if (offset === 0) {
        this.#trimNodeStart(node, count);
        bubble(node);
      } else {
        const y = this.#splitNode(node, offset, count);
        this.tree.insert_after(node, y);
      }
    } else {
      let x = node;
      let i = 0;

      if (offset !== 0) {
        x = this.#splitNode(node, offset, 0);
        this.tree.insert_after(node, x);
      }

      const last = find(this.tree.root, end);
      if (last && last.offset !== 0) {
        const y = this.#splitNode(last.node, last.offset, 0);
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

  delete2(start: [number, number], end?: [number, number]): void {
    const i = this.#posToIndex(start);
    if (typeof i !== "number") {
      return;
    }

    this.delete(i, this.#posToIndex(end));
  }

  #createNode(text: string): TreeNode {
    const buf = new TextBuffer(text);
    const buf_index = this.#bufs.push(buf) - 1;

    return new TreeNode(buf_index, 0, buf.text.length, 0, buf.eols.length);
  }

  #splitNode(x: TreeNode, index: number, gap: number): TreeNode {
    const buf = this.#bufs[x.buf]!;

    const start = x.slice_start + index + gap;
    const len = x.slice_len - index - gap;

    this.#resizeNode(x, index);
    bubble(x);

    const eols_start = buf.indexToLine(start, x.eols_start + x.eols_len);
    const eols_end = buf.indexToLine(start + len, eols_start);
    const eols_len = eols_end - eols_start;

    return new TreeNode(x.buf, start, len, eols_start, eols_len);
  }

  *#readNode(x: TreeNode, offset: number, n: number): Generator<string> {
    while (!x.nil && (n > 0)) {
      const count = Math.min(x.slice_len - offset, n);

      yield this.#bufs[x.buf]!.text.slice(
        x.slice_start + offset,
        x.slice_start + offset + count,
      );

      x = successor(x);
      offset = 0;
      n -= count;
    }
  }

  #isNodeGrowable(x: TreeNode): boolean {
    const buf = this.#bufs[x.buf]!;

    return (buf.text.length < 100) &&
      (x.slice_start + x.slice_len === buf.text.length);
  }

  #growNode(x: TreeNode, text: string): void {
    this.#bufs[x.buf]!.append(text);

    this.#resizeNode(x, x.slice_len + text.length);
  }

  #trimNodeStart(x: TreeNode, n: number): void {
    const buf = this.#bufs[x.buf]!;

    x.slice_start += n;
    x.slice_len -= n;

    x.eols_start = buf.indexToLine(x.slice_start, x.eols_start);

    const eols_end = buf.indexToLine(
      x.slice_start + x.slice_len,
      x.eols_start,
    );

    x.eols_len = eols_end - x.eols_start;
  }

  #trimNodeEnd(x: TreeNode, n: number): void {
    this.#resizeNode(x, x.slice_len - n);
  }

  #resizeNode(x: TreeNode, len: number): void {
    const buf = this.#bufs[x.buf]!;

    x.slice_len = len;

    const eols_end = buf.indexToLine(
      x.slice_start + x.slice_len,
      x.eols_start,
    );

    x.eols_len = eols_end - x.eols_start;
  }

  #posToIndex(pos?: [number, number]): number | undefined {
    if (!pos) {
      return;
    }

    const i = this.#findLineStart(pos[0]);
    if (typeof i !== "number") {
      return;
    }

    return i + pos[1];
  }

  #findLineStart(ln: number): number | undefined {
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
        const buf = this.#bufs[x.buf]!;
        const eol_end = buf.eols[x.eols_start + eol_index]!.end;
        return i + eol_end - x.slice_start;
      }

      eol_index -= x.eols_len;
      i += x.slice_len;
      x = x.right;
    }
  }
}
