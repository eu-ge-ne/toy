import { iter_to_str } from "@lib/std";

import { Node, TextBuf } from "@eu-ge-ne/text-buf";

export type Snapshot = Node;

type Pos = { ln: number; col: number };

export class SegBuf {
  #buf = new TextBuf();
  #sgr = new Intl.Segmenter();

  get line_count(): number {
    return this.#buf.line_count;
  }

  reset(text?: string): void {
    this.#buf.reset(text);
  }

  save(): Snapshot {
    return this.#buf.save();
  }

  restore(s: Snapshot): void {
    this.#buf.restore(s);
  }

  append(text: string): void {
    this.#buf.append(text);
  }

  read(): string {
    return iter_to_str(this.#buf.read(0));
  }

  iter(): Generator<string> {
    return this.#buf.read(0);
  }

  *seg_line(ln: number): Generator<string> {
    for (const chunk of this.#buf.read2([ln, 0], [ln + 1, 0])) {
      for (const x of this.#sgr.segment(chunk)) {
        yield x.segment;
      }
    }
  }

  *seg_read(start: Pos, end: Pos): Generator<string> {
    yield* this.#buf.read2(this.#to_unit_pos(start), this.#to_unit_pos(end));
  }

  seg_insert(pos: Pos, text: string): void {
    this.#buf.insert2(this.#to_unit_pos(pos), text);
  }

  seg_delete(start: Pos, end: Pos): void {
    this.#buf.delete2(this.#to_unit_pos(start), this.#to_unit_pos(end));
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
