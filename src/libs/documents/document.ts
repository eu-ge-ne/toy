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
      this.tree.root = TreeNode.createFromText(this.#bufs, text);
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

    while (!x.isNIL) {
      if (i <= x.left.totalLen) {
        insert_case = InsertionCase.Left;
        p = x;
        x = x.left;
        continue;
      }

      i -= x.left.totalLen;

      if (i < x.slice.length) {
        insert_case = InsertionCase.Split;
        p = x;
        x = TreeNode.NIL;
        continue;
      }

      i -= x.slice.length;

      insert_case = InsertionCase.Right;
      p = x;
      x = x.right;
    }

    if (insert_case === InsertionCase.Right && this.#isNodeGrowable(p)) {
      p.append(this.#bufs, text);

      return;
    }

    const child = TreeNode.createFromText(this.#bufs, text);

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
        const y = p.split(this.#bufs, i);
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

    if (offset2 === first.node.slice.length) {
      if (first.offset === 0) {
        this.tree.delete(first.node);
      } else {
        first.node.trimEnd(this.#bufs, count);
      }
    } else if (offset2 < first.node.slice.length) {
      if (first.offset === 0) {
        first.node.trimStart(this.#bufs, count);
      } else {
        const y = first.node.split(this.#bufs, first.offset);
        this.tree.insertAfter(first.node, y);
        y.trimStart(this.#bufs, count);
      }
    } else {
      let x = first.node;
      let i = 0;

      if (first.offset !== 0) {
        x = first.node.split(this.#bufs, first.offset);
        this.tree.insertAfter(first.node, x);
      }

      const last = this.tree.find(end);
      if (last && last.offset !== 0) {
        const y = last.node.split(this.#bufs, last.offset);
        this.tree.insertAfter(last.node, y);
      }

      while (!x.isNIL && (i < count)) {
        i += x.slice.length;

        const next = x.successor();

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

  *#readNode(x: TreeNode, offset: number, n: number): Generator<string> {
    while (!x.isNIL && (n > 0)) {
      const count = Math.min(x.slice.length - offset, n);

      yield this.#bufs[x.bufIndex]!.text.slice(
        x.slice.start + offset,
        x.slice.start + offset + count,
      );

      x = x.successor();
      offset = 0;
      n -= count;
    }
  }

  #isNodeGrowable(x: TreeNode): boolean {
    const buf = this.#bufs[x.bufIndex]!;

    return (buf.text.length < 100) &&
      (x.slice.start + x.slice.length === buf.text.length);
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

    while (!x.isNIL) {
      if (eol_index < x.left.totalEolsLen) {
        x = x.left;
        continue;
      }

      eol_index -= x.left.totalEolsLen;
      i += x.left.totalLen;

      if (eol_index < x.eolSlice.length) {
        const buf = this.#bufs[x.bufIndex]!;
        const eol_end = buf.eols[x.eolSlice.start + eol_index]!.end;
        return i + eol_end - x.slice.start;
      }

      eol_index -= x.eolSlice.length;
      i += x.slice.length;
      x = x.right;
    }
  }
}
