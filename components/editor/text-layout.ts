import { segmenter } from "@lib/graphemes";
import { TextBuf } from "@lib/text-buf";

interface Pos {
  ln: number;
  col: number;
}

export class TextLayout {
  constructor(private readonly textBuf: TextBuf) {
  }

  line(ln: number, extra = false): IteratorObject<segmenter.Segment> {
    const chunks = this.textBuf.read2([ln, 0], [ln + 1, 0]);
    return segmenter.segments(chunks, extra);
  }

  read(start: Pos, end: Pos): string {
    return this.textBuf.read2(this.#unitPos(start), this.#unitPos(end))
      .reduce((a, x) => a + x, "");
  }

  insert(pos: Pos, text: string): void {
    this.textBuf.insert2(this.#unitPos(pos), text);
  }

  delete(start: Pos, end: Pos): void {
    this.textBuf.delete2(this.#unitPos(start), this.#unitPos(end));
  }

  #unitPos({ ln, col }: Pos): [number, number] {
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
