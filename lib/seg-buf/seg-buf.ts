import { Node, TextBuf } from "@eu-ge-ne/text-buf";

import { Grapheme, graphemes } from "@lib/grapheme";
import * as vt from "@lib/vt";

export type Snapshot = Node;

type Pos = { ln: number; col: number };

export class SegBuf {
  #buf = new TextBuf();
  #sgr = new Intl.Segmenter();

  wrap_width = Number.MAX_SAFE_INTEGER;
  measure_y = 0;
  measure_x = 0;

  get line_count(): number {
    return this.#buf.line_count;
  }

  save(): Snapshot {
    return this.#buf.save();
  }

  restore(s: Snapshot): void {
    this.#buf.restore(s);
  }

  reset(text?: string): void {
    this.#buf.reset(text);
  }

  append(text: string): void {
    this.#buf.append(text);
  }

  iter(): Generator<string> {
    return this.#buf.read(0);
  }

  text(): string {
    return this.#buf.read(0).reduce((a, x) => a + x, "");
  }

  *line(
    ln: number,
    extra = false,
  ): Generator<{ i: number; g: Grapheme; ln: number; col: number }> {
    const { measure_y, measure_x, wrap_width } = this;

    const c = {
      i: 0,
      g: undefined as unknown as Grapheme,
      ln: 0,
      col: 0,
    };

    let w = 0;

    for (const chunk of this.#buf.read2([ln, 0], [ln + 1, 0])) {
      for (const { segment } of this.#sgr.segment(chunk)) {
        c.g = graphemes.get(segment);

        if (c.g.width < 0) {
          c.g.width = vt.cursor.measure(measure_y, measure_x, c.g.bytes);
        }

        w += c.g.width;
        if (w > wrap_width) {
          w = c.g.width;
          c.ln += 1;
          c.col = 0;
        }

        yield c;

        c.i += 1;
        c.col += 1;
      }
    }

    if (extra) {
      c.g = graphemes.get(" ");

      w += c.g.width;
      if (w > wrap_width) {
        w = c.g.width;
        c.ln += 1;
        c.col = 0;
      }

      yield c;
    }
  }

  read(start: Pos, end: Pos): string {
    return this.#buf.read2(this.#to_unit_pos(start), this.#to_unit_pos(end))
      .reduce((a, x) => a + x, "");
  }

  insert(pos: Pos, text: string): void {
    this.#buf.insert2(this.#to_unit_pos(pos), text);
  }

  delete(start: Pos, end: Pos): void {
    this.#buf.delete2(this.#to_unit_pos(start), this.#to_unit_pos(end));
  }

  #to_unit_pos({ ln, col }: Pos): [number, number] {
    let unit_col = 0;
    let i = 0;

    for (const { g } of this.line(ln)) {
      if (i === col) {
        break;
      }

      if (i < col) {
        unit_col += g.seg.length;
      }

      i += 1;
    }

    return [ln, unit_col];
  }
}
