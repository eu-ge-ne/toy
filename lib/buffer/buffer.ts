import { TextBuf } from "@eu-ge-ne/text-buf";

export type Snapshot = InstanceType<typeof TextBuf>["root"];

type Pos = { ln: number; col: number };

export class Buffer extends TextBuf {
  #sgr = new Intl.Segmenter();

  save(): Snapshot {
    return structuredClone(this.root);
  }

  restore(x: Snapshot): void {
    this.root = structuredClone(x);
  }

  get text(): string {
    return this.read(0).reduce((a, x) => a + x, "");
  }

  set text(text: string) {
    this.delete(0);
    this.insert(0, text);
  }

  seg_read(from: Pos, to: Pos): string {
    return this.read(
      this.#unit_pos(from),
      this.#unit_pos({ ln: to.ln, col: to.col + 1 }),
    ).reduce((a, x) => a + x, "");
  }

  *seg_line(ln: number): Generator<string> {
    for (const chunk of this.read([ln, 0], [ln + 1, 0])) {
      for (const { segment } of this.#sgr.segment(chunk)) {
        yield segment;
      }
    }
  }

  seg_insert(pos: Pos, text: string): void {
    this.insert(this.#unit_pos(pos), text);
  }

  seg_delete(from: Pos, to: Pos): void {
    this.delete(
      this.#unit_pos(from),
      this.#unit_pos({ ln: to.ln, col: to.col + 1 }),
    );
  }

  #unit_pos({ ln, col }: Pos): [number, number] {
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
