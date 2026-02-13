import { Node, TextBuf } from "@lib/text-buf";

import { Grapheme, segmenter } from "@lib/graphemes";

export type Snapshot = Node;

type Pos = { ln: number; col: number };

export class SegBuf {
  buf = new TextBuf();

  text(): string {
    return this.buf.read(0).reduce((a, x) => a + x, "");
  }

  line(
    ln: number,
    extra = false,
  ): IteratorObject<{ i: number; gr: Grapheme; ln: number; col: number }> {
    const chunks = this.buf.read2([ln, 0], [ln + 1, 0]);
    return segmenter.segments(chunks, extra);
  }

  read(start: Pos, end: Pos): string {
    return this.buf.read2(this.#unit_pos(start), this.#unit_pos(end))
      .reduce((a, x) => a + x, "");
  }

  insert(pos: Pos, text: string): void {
    this.buf.insert2(this.#unit_pos(pos), text);
  }

  delete(start: Pos, end: Pos): void {
    this.buf.delete2(this.#unit_pos(start), this.#unit_pos(end));
  }

  #unit_pos({ ln, col }: Pos): [number, number] {
    let unit_col = 0;
    let i = 0;

    for (const { gr } of this.line(ln)) {
      if (i === col) {
        break;
      }

      if (i < col) {
        unit_col += gr.char.length;
      }

      i += 1;
    }

    return [ln, unit_col];
  }
}
