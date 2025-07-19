import { TextBuf } from "@eu-ge-ne/text-buf";

export type Snapshot = InstanceType<typeof TextBuf>["root"];

type Pos = [number, number];

const EOL_RE = /\r?\n/gm;

export class Buf {
  #segmenter = new Intl.Segmenter();
  #buf = new TextBuf();

  get_text(): string {
    return this.#buf.read(0);
  }

  set_text(x: string): void {
    this.#buf = new TextBuf(x);
  }

  get_snapshot(): Snapshot {
    return structuredClone(this.#buf.root);
  }

  set_snapshot(x: Snapshot): void {
    this.#buf.root = structuredClone(x);
  }

  get ln_count(): number {
    return this.#buf.line_count;
  }

  *line_segments(ln: number): Generator<string> {
    const text = this.#buf.read([ln, 0], [ln + 1, 0]);

    for (const { segment } of this.#segmenter.segment(text)) {
      yield segment;
    }
  }

  line_length(ln: number): number {
    return this.#count_segments(this.#buf.read([ln, 0], [ln + 1, 0]));
  }

  insert([ln, col]: Pos, text: string): void {
    // TODO
    const col0 = this.#unit_index(this.#line(ln), col);

    this.#buf.insert([ln, col0], text);
  }

  delete([from_ln, from_col]: Pos, [to_ln, to_col]: Pos): void {
    const col0 = this.#unit_index(this.#line(from_ln), from_col);
    const col1 = this.#unit_index(this.#line(to_ln), to_col + 1);

    this.#buf.delete([from_ln, col0], [to_ln, col1]);
  }

  copy([from_ln, from_col]: Pos, [to_ln, to_col]: Pos): string {
    const col0 = this.#unit_index(this.#line(from_ln), from_col);
    const col1 = this.#unit_index(this.#line(to_ln), to_col + 1);

    return this.#buf.read([from_ln, col0], [to_ln, col1]);
  }

  measure(text: string): [number, number] {
    const eols = text.matchAll(EOL_RE).toArray();

    if (eols.length === 0) {
      return [0, this.#count_segments(text)];
    } else {
      const eol = eols.at(-1)!;
      const last_line = text.slice(eol.index + eol[0].length);

      return [eols.length, this.#count_segments(last_line)];
    }
  }

  #line(ln: number): string {
    return this.#buf.read([ln, 0], [ln + 1, 0]);
  }

  #count_segments(text: string): number {
    return [...this.#segmenter.segment(text)].length;
  }

  #unit_index(text: string, grapheme_index: number): number {
    let unit_index = 0;

    let i = 0;
    for (const { segment } of this.#segmenter.segment(text)) {
      if (i === grapheme_index) {
        break;
      }

      if (i < grapheme_index) {
        unit_index += segment.length;
      }

      i += 1;
    }

    return unit_index;
  }
}
