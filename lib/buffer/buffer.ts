import { TextBuf } from "@eu-ge-ne/text-buf";

export type Snapshot = InstanceType<typeof TextBuf>["root"];

type Pos = { ln: number; col: number };

export class Buffer extends TextBuf {
  #sgr = new Intl.Segmenter();

  get text(): string {
    return this.read(0).reduce((a, x) => a + x, "");
  }

  set text(text: string) {
    this.delete(0);
    this.insert(0, text);
  }

  save(): Snapshot {
    return structuredClone(this.root);
  }

  restore(x: Snapshot): void {
    this.root = structuredClone(x);
  }

  append(text: string): void {
    this.insert(this.count, text);
  }

  seg_read(from: Pos, to: Pos): string {
    return this.read(
      [from.ln, this.#unit_col(from.ln, from.col)],
      [to.ln, this.#unit_col(to.ln, to.col + 1)],
    ).reduce((a, x) => a + x, "");
  }

  *seg_line(ln: number): Generator<string> {
    for (const chunk of this.read([ln, 0], [ln + 1, 0])) {
      for (const { segment } of this.#sgr.segment(chunk)) {
        yield segment;
      }
    }
  }

  seg_insert({ ln, col }: Pos, text: string): void {
    this.insert(
      [ln, this.#unit_col(ln, col)],
      text,
    );
  }

  seg_delete(from: Pos, to: Pos): void {
    this.delete(
      [from.ln, this.#unit_col(from.ln, from.col)],
      [to.ln, this.#unit_col(to.ln, to.col + 1)],
    );
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
