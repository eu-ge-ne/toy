import { TextBuf } from "@eu-ge-ne/text-buf";
import { Grapheme, GraphemeSegmenter } from "@lib/grapheme";

export type Snapshot = InstanceType<typeof TextBuf>["root"];

type Pos = [number, number];

export class Buf {
  #buf = new TextBuf();

  constructor(private segmenter: GraphemeSegmenter) {
  }

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

  line_text(ln: number): string {
    return this.#buf.read([ln, 0], [ln + 1, 0]);
  }

  line_graphemes(ln: number): IteratorObject<Grapheme> {
    return this.segmenter.graphemes(this.line_text(ln));
  }

  insert([ln, col]: Pos, text: string): void {
    const col0 = this.segmenter.unit_index(this.line_text(ln), col);

    this.#buf.insert([ln, col0], text);
  }

  delete([from_ln, from_col]: Pos, [to_ln, to_col]: Pos): void {
    const col0 = this.segmenter.unit_index(this.line_text(from_ln), from_col);
    const col1 = this.segmenter.unit_index(this.line_text(to_ln), to_col + 1);

    this.#buf.delete([from_ln, col0], [to_ln, col1]);
  }

  copy([from_ln, from_col]: Pos, [to_ln, to_col]: Pos): string {
    const col0 = this.segmenter.unit_index(this.line_text(from_ln), from_col);
    const col1 = this.segmenter.unit_index(this.line_text(to_ln), to_col + 1);

    return this.#buf.read([from_ln, col0], [to_ln, col1]);
  }
}
