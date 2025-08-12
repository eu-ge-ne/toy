import { Node, TextBuf } from "@eu-ge-ne/text-buf";

export type Snapshot = Node;

type Pos = { ln: number; col: number };

export class Buffer extends TextBuf {
  #sgr = new Intl.Segmenter();

  *seg_line(ln: number): Generator<string> {
    for (const chunk of this.read([ln, 0], [ln + 1, 0])) {
      for (const { segment } of this.#sgr.segment(chunk)) {
        yield segment;
      }
    }
  }

  *seg_read(start: Pos, end: Pos): Generator<string> {
    yield* this.read(this.#to_unit_pos(start), this.#to_unit_pos(end));
  }

  seg_insert(pos: Pos, text: string): void {
    this.insert(this.#to_unit_pos(pos), text);
  }

  seg_delete(start: Pos, end: Pos): void {
    this.delete(this.#to_unit_pos(start), this.#to_unit_pos(end));
  }

  #to_unit_pos({ ln, col }: Pos): [number, number] {
    let unit_col = 0;
    let i = 0;

    for (const seg of this.seg_line(ln)) {
      if (i === col) {
        break;
      }

      if (i < col) {
        unit_col += seg.length;
      }

      i += 1;
    }

    return [ln, unit_col];
  }
}
