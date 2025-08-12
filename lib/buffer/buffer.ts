import { TextBuf } from "@eu-ge-ne/text-buf";

export type Snapshot = InstanceType<typeof TextBuf>["root"];

type Pos = { ln: number; col: number };

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

  *seg_line(ln: number): Generator<string> {
    for (const chunk of this.#buf.read([ln, 0], [ln + 1, 0])) {
      for (const { segment } of this.#sgr.segment(chunk)) {
        yield segment;
      }
    }
  }

  append(text: string): void {
    this.#buf.insert(this.#buf.count, text);
  }

  insert({ ln, col }: Pos, text: string): void {
    this.#buf.insert(
      [ln, this.#unit_col(ln, col)],
      text,
    );
  }

  delete(from: Pos, to: Pos): void {
    this.#buf.delete(
      [from.ln, this.#unit_col(from.ln, from.col)],
      [to.ln, this.#unit_col(to.ln, to.col + 1)],
    );
  }

  copy(from: Pos, to: Pos): string {
    return this.#buf.read(
      [from.ln, this.#unit_col(from.ln, from.col)],
      [to.ln, this.#unit_col(to.ln, to.col + 1)],
    ).reduce((a, x) => a + x, "");
  }

  #unit_col(ln: number, col: number): number {
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

    return unit_col;
  }
}
