import * as documents from "@libs/documents";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";

export class Buffer {
  readonly #doc = new documents.Document();
  readonly #gDoc = new graphemes.Document(this.#doc);
  readonly #history = new history.History<documents.Node>();

  onChange?: () => void;

  get lineCount(): number {
    return this.#doc.lineCount;
  }

  get modified(): boolean {
    return !this.#history.empty;
  }

  get data(): string {
    return this.#doc.text;
  }

  set data(x: string) {
    this.#doc.text = x;
  }

  read(): Iterable<string> {
    return this.#doc.read(0);
  }

  slice(start: graphemes.Pos, end: graphemes.Pos): string {
    return this.#gDoc.read(start, end);
  }

  line(ln: number, extra = false): IteratorObject<graphemes.Segment> {
    return this.#gDoc.line(ln, extra);
  }

  append(text: string): void {
    this.#doc.append(text);
  }

  insert(pos: graphemes.Pos, text: string): void {
    this.#gDoc.insert(pos, text);
  }

  delete(start: graphemes.Pos, end: graphemes.Pos): void {
    this.#gDoc.delete(start, end);
  }

  edit(fn: () => void): void {
    fn();

    this.#history.push(this.#doc.tree.root);

    this.onChange?.();
  }

  undo(): void {
    const entry = this.#history.undo();
    if (entry) {
      this.#doc.tree.root = entry;
    }

    this.onChange?.();
  }

  redo(): void {
    const entry = this.#history.redo();
    if (entry) {
      this.#doc.tree.root = entry;
    }

    this.onChange?.();
  }

  resetHistory(): void {
    this.#history.reset(this.#doc.tree.root);

    this.onChange?.();
  }
}
