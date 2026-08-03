import { Slice } from "./slice.ts";
import { TextBuffer } from "./text-buffer.ts";
import { TreeNode } from "./tree/node.ts";
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
    return this.tree.root.totalLen;
  }

  get lineCount(): number {
    return this.tree.root.totalLen === 0 ? 0 : this.tree.root.totalEolsLen + 1;
  }

  *read(start: number, end = Number.MAX_SAFE_INTEGER): Generator<string> {
    const first = this.tree.find(start);
    if (!first) {
      return;
    }

    yield* this.#readNode(first.node, first.offset, end - start);
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
    let p = TreeNode.NIL;
    let x = this.tree.root;

    while (!x.nil) {
      if (i <= x.left.totalLen) {
        insert_case = InsertionCase.Left;
        p = x;
        x = x.left;
        continue;
      }

      i -= x.left.totalLen;

      if (i < x.sliceLen) {
        insert_case = InsertionCase.Split;
        p = x;
        x = TreeNode.NIL;
        continue;
      }

      i -= x.sliceLen;

      insert_case = InsertionCase.Right;
      p = x;
      x = x.right;
    }

    if (insert_case === InsertionCase.Right && this.#isNodeGrowable(p)) {
      this.#growNode(p, text);

      this.tree.bubbleUpdate(p);

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
        this.tree.insertLeft(p, child);
        break;
      }
      case InsertionCase.Right: {
        this.tree.insertRight(p, child);
        break;
      }
      case InsertionCase.Split: {
        const y = this.#splitNode(p, i, 0);
        this.tree.insertAfter(p, y);
        this.tree.insertBefore(y, child);
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
    const first = this.tree.find(start);
    if (!first) {
      return;
    }

    const count = end - start;
    const offset2 = first.offset + count;

    if (offset2 === first.node.sliceLen) {
      if (first.offset === 0) {
        this.tree.delete(first.node);
      } else {
        this.#trimNodeEnd(first.node, count);
        this.tree.bubbleUpdate(first.node);
      }
    } else if (offset2 < first.node.sliceLen) {
      if (first.offset === 0) {
        this.#trimNodeStart(first.node, count);
        this.tree.bubbleUpdate(first.node);
      } else {
        const y = this.#splitNode(first.node, first.offset, count);
        this.tree.insertAfter(first.node, y);
      }
    } else {
      let x = first.node;
      let i = 0;

      if (first.offset !== 0) {
        x = this.#splitNode(first.node, first.offset, 0);
        this.tree.insertAfter(first.node, x);
      }

      const last = this.tree.find(end);
      if (last && last.offset !== 0) {
        const y = this.#splitNode(last.node, last.offset, 0);
        this.tree.insertAfter(last.node, y);
      }

      while (!x.nil && (i < count)) {
        i += x.sliceLen;

        const next = this.tree.successor(x);

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

    return TreeNode.create(
      buf_index,
      0,
      buf.text.length,
      new Slice(0, buf.eols.length),
    );
  }

  #splitNode(x: TreeNode, index: number, gap: number): TreeNode {
    const buf = this.#bufs[x.buf]!;

    const start = x.sliceStart + index + gap;
    const len = x.sliceLen - index - gap;

    this.#resizeNode(x, index);
    this.tree.bubbleUpdate(x);

    const eolSlice = new Slice(
      buf.getEolIndex(start),
      buf.getEolIndex(start + len),
    );

    return TreeNode.create(x.buf, start, len, eolSlice);
  }

  *#readNode(x: TreeNode, offset: number, n: number): Generator<string> {
    while (!x.nil && (n > 0)) {
      const count = Math.min(x.sliceLen - offset, n);

      yield this.#bufs[x.buf]!.text.slice(
        x.sliceStart + offset,
        x.sliceStart + offset + count,
      );

      x = this.tree.successor(x);
      offset = 0;
      n -= count;
    }
  }

  #isNodeGrowable(x: TreeNode): boolean {
    const buf = this.#bufs[x.buf]!;

    return (buf.text.length < 100) &&
      (x.sliceStart + x.sliceLen === buf.text.length);
  }

  #growNode(x: TreeNode, text: string): void {
    this.#bufs[x.buf]!.append(text);

    this.#resizeNode(x, x.sliceLen + text.length);
  }

  #trimNodeStart(x: TreeNode, n: number): void {
    const buf = this.#bufs[x.buf]!;

    x.sliceStart += n;
    x.sliceLen -= n;

    x.eolSlice = new Slice(
      buf.getEolIndex(x.sliceStart),
      x.eolSlice.end,
    );
  }

  #trimNodeEnd(x: TreeNode, n: number): void {
    this.#resizeNode(x, x.sliceLen - n);
  }

  #resizeNode(x: TreeNode, len: number): void {
    const buf = this.#bufs[x.buf]!;

    x.sliceLen = len;

    x.eolSlice = new Slice(
      x.eolSlice.start,
      buf.getEolIndex(x.sliceStart + x.sliceLen),
    );
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
      if (eol_index < x.left.totalEolsLen) {
        x = x.left;
        continue;
      }

      eol_index -= x.left.totalEolsLen;
      i += x.left.totalLen;

      if (eol_index < x.eolSlice.length) {
        const buf = this.#bufs[x.buf]!;
        const eol_end = buf.eols[x.eolSlice.start + eol_index]!.end;
        return i + eol_end - x.sliceStart;
      }

      eol_index -= x.eolSlice.length;
      i += x.sliceLen;
      x = x.right;
    }
  }
}
