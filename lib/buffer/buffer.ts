import { TextBuf } from "@eu-ge-ne/text-buf";

export type Snapshot = InstanceType<typeof TextBuf>["root"];

type Pos = [number, number];

const EOL_RE = /\r?\n/gm;

export class Buffer {
  #sgr = new Intl.Segmenter();
  #buf = new TextBuf();

  get text(): string {
    return this.#buf.read(0).reduce((a, x) => a + x, "");
  }

  set text(text: string) {
    this.#buf.delete(0);
    this.#buf.insert(0, text);
  }

  *read(): Generator<string> {
    yield* this.#buf.read(0);
  }

  save(): Snapshot {
    return structuredClone(this.#buf.root);
  }

  restore(x: Snapshot): void {
    this.#buf.root = structuredClone(x);
  }

  get ln_count(): number {
    return this.#buf.line_count;
  }

  *line(ln: number): Generator<string> {
    for (const chunk of this.#read_line(ln)) {
      for (const { segment } of this.#sgr.segment(chunk)) {
        yield segment;
      }
    }
  }

  line_length(ln: number): number {
    return this.#read_line(ln).reduce((a, x) => a + this.#count_segments(x), 0);
  }

  append(text: string): void {
    this.#buf.insert(this.#buf.count, text);
  }

  insert([ln, col]: Pos, text: string): [number, number] {
    const col0 = this.#line_unit_index(ln, col);

    this.#buf.insert([ln, col0], text);

    const eols = text.matchAll(EOL_RE).toArray();

    if (eols.length === 0) {
      return [0, this.#count_segments(text)];
    } else {
      const eol = eols.at(-1)!;
      const last_line = text.slice(eol.index + eol[0].length);

      return [eols.length, this.#count_segments(last_line)];
    }
  }

  delete([from_ln, from_col]: Pos, [to_ln, to_col]: Pos): void {
    const col0 = this.#line_unit_index(from_ln, from_col);
    const col1 = this.#line_unit_index(to_ln, to_col + 1);

    this.#buf.delete([from_ln, col0], [to_ln, col1]);
  }

  copy([from_ln, from_col]: Pos, [to_ln, to_col]: Pos): string {
    const col0 = this.#line_unit_index(from_ln, from_col);
    const col1 = this.#line_unit_index(to_ln, to_col + 1);

    return this.#buf.read([from_ln, col0], [to_ln, col1]).reduce(
      (a, x) => a + x,
      "",
    );
  }

  *#read_line(ln: number): Generator<string> {
    yield* this.#buf.read([ln, 0], [ln + 1, 0]);
  }

  #count_segments(text: string): number {
    return [...this.#sgr.segment(text)].length;
  }

  #line_unit_index(ln: number, grm_index: number): number {
    let unit_index = 0;
    let i = 0;

    for (const seg of this.line(ln)) {
      if (i === grm_index) {
        break;
      }

      if (i < grm_index) {
        unit_index += seg.length;
      }

      i += 1;
    }

    return unit_index;
  }
}
