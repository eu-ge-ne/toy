import { Buf } from "./buf.ts";
import { Slice } from "./slice.ts";
import { TreeNode } from "./tree/node.ts";
import { Tree } from "./tree/tree.ts";

export const enum InsertionCase {
  Root,
  Left,
  Right,
  Split,
}

export class Document {
  readonly tree = new Tree();

  constructor(text?: string) {
    if (text && text.length > 0) {
      const buf = new Buf(text);
      const slice = Slice.create(buf, 0, buf.text.length);

      const node = TreeNode.create(this.tree.dirty, buf, slice);
      node.red = false;

      this.tree.root = node;
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

    yield* first.node.read(first.offset, end - start);
  }

  *read2(
    startLn: number,
    startCol: number,
    endLn?: number,
    endCol?: number,
  ): Generator<string> {
    const i = this.#posToIndex(startLn, startCol);
    if (typeof i !== "number") {
      return;
    }

    yield* this.read(i, this.#posToIndex(endLn, endCol));
  }

  insert(i: number, text: string): void {
    if (i > this.charCount) {
      return;
    }

    let insertCase = InsertionCase.Root;
    let p = TreeNode.NIL;
    let x = this.tree.root;

    while (!x.isNIL) {
      if (i <= x.left.totalLen) {
        insertCase = InsertionCase.Left;
        p = x;
        x = x.left;
        continue;
      }

      i -= x.left.totalLen;

      if (i < x.slice.length) {
        insertCase = InsertionCase.Split;
        p = x;
        x = TreeNode.NIL;
        continue;
      }

      i -= x.slice.length;

      insertCase = InsertionCase.Right;
      p = x;
      x = x.right;
    }

    if (insertCase === InsertionCase.Right && p.isGrowable) {
      p.append(text);
      return;
    }

    const buf = new Buf(text);
    const child = TreeNode.create(
      this.tree.dirty,
      buf,
      Slice.create(buf, 0, buf.text.length),
    );

    switch (insertCase) {
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
        const y = p.split(i);
        this.tree.insertAfter(p, y);
        this.tree.insertBefore(y, child);
        break;
      }
    }
  }

  insert2(ln: number, col: number, text: string): void {
    const i = this.#posToIndex(ln, col);
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
        first.node.trimEnd(count);
      }
    } else if (offset2 < first.node.slice.length) {
      if (first.offset === 0) {
        first.node.trimStart(count);
      } else {
        const y = first.node.split(first.offset);
        this.tree.insertAfter(first.node, y);
        y.trimStart(count);
      }
    } else {
      let x = first.node;
      let i = 0;

      if (first.offset !== 0) {
        x = first.node.split(first.offset);
        this.tree.insertAfter(first.node, x);
      }

      const last = this.tree.find(end);
      if (last && last.offset !== 0) {
        const y = last.node.split(last.offset);
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

  delete2(
    startLn: number,
    startCol: number,
    endLn?: number,
    endCol?: number,
  ): void {
    const i = this.#posToIndex(startLn, startCol);
    if (typeof i !== "number") {
      return;
    }

    this.delete(i, this.#posToIndex(endLn, endCol));
  }

  #posToIndex(ln?: number, col?: number): number | undefined {
    if (typeof ln !== "number" || typeof col !== "number") {
      return;
    }

    const i = this.tree.root.findLineStart(ln);
    if (typeof i !== "number") {
      return;
    }

    return i + col;
  }
}
