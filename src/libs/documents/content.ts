import { bubble, create as create_node, type Node, successor } from "./node.ts";
import { TextBuffer } from "./text-buffer.ts";

export class Content {
  readonly buffers: TextBuffer[] = [];

  create(text: string): Node {
    const buf = new TextBuffer(text);
    const buf_index = this.buffers.push(buf) - 1;

    return create_node(buf_index, 0, buf.text.length, 0, buf.eols.length);
  }

  split(x: Node, index: number, gap: number): Node {
    const buf = this.buffers[x.buf]!;

    const start = x.slice_start + index + gap;
    const len = x.slice_len - index - gap;

    this.#resize(x, index);
    bubble(x);

    const eols_start = buf.findEolIndex(start, x.eols_start + x.eols_len);
    const eols_end = buf.findEolIndex(start + len, eols_start);
    const eols_len = eols_end - eols_start;

    return create_node(x.buf, start, len, eols_start, eols_len);
  }

  *read(x: Node, offset: number, n: number): Generator<string> {
    while (!x.nil && (n > 0)) {
      const count = Math.min(x.slice_len - offset, n);

      yield this.buffers[x.buf]!.text.slice(
        x.slice_start + offset,
        x.slice_start + offset + count,
      );

      x = successor(x);
      offset = 0;
      n -= count;
    }
  }

  growable(x: Node): boolean {
    const buf = this.buffers[x.buf]!;

    return (buf.text.length < 100) &&
      (x.slice_start + x.slice_len === buf.text.length);
  }

  grow(x: Node, text: string): void {
    this.buffers[x.buf]!.append(text);

    this.#resize(x, x.slice_len + text.length);
  }

  trim_start(x: Node, n: number): void {
    const buf = this.buffers[x.buf]!;

    x.slice_start += n;
    x.slice_len -= n;

    x.eols_start = buf.findEolIndex(x.slice_start, x.eols_start);

    const eols_end = buf.findEolIndex(
      x.slice_start + x.slice_len,
      x.eols_start,
    );

    x.eols_len = eols_end - x.eols_start;
  }

  trim_end(x: Node, n: number): void {
    this.#resize(x, x.slice_len - n);
  }

  #resize(x: Node, len: number): void {
    const buf = this.buffers[x.buf]!;

    x.slice_len = len;

    const eols_end = buf.findEolIndex(
      x.slice_start + x.slice_len,
      x.eols_start,
    );

    x.eols_len = eols_end - x.eols_start;
  }
}
