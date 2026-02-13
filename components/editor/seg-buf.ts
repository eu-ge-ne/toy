import { segmenter } from "@lib/graphemes";
import { Node, TextBuf } from "@lib/text-buf";

export type Snapshot = Node;

type Pos = { ln: number; col: number };

export class SegBuf {
  constructor(private readonly buffer: TextBuf) {
  }

  line(ln: number, extra = false): IteratorObject<segmenter.Segment> {
    const chunks = this.buffer.read2([ln, 0], [ln + 1, 0]);
    return segmenter.segments(chunks, extra);
  }

  read(start: Pos, end: Pos): string {
    return this.buffer.read2(this.#unit_pos(start), this.#unit_pos(end))
      .reduce((a, x) => a + x, "");
  }

  insert(pos: Pos, text: string): void {
    this.buffer.insert2(this.#unit_pos(pos), text);
  }

  delete(start: Pos, end: Pos): void {
    this.buffer.delete2(this.#unit_pos(start), this.#unit_pos(end));
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
