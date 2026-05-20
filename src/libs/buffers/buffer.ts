import * as documents from "@libs/documents";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";

export class Buffer {
  readonly #doc = new documents.Document();
  readonly #gDoc = new graphemes.Document(this.#doc);
  readonly #history = new history.History<documents.Node>();

  get lineCount(): number {
    return this.#doc.lineCount;
  }

  gLine(ln: number, extra = false): IteratorObject<graphemes.Segment> {
    return this.#gDoc.line(ln, extra);
  }

  get modified(): boolean {
    return !this.#history.empty;
  }

  get text(): string {
    return this.#doc.text;
  }

  set text(x: string) {
    this.#doc.text = x;
  }

  read(): Iterable<string> {
    return this.#doc.read(0);
  }

  append(text: string): void {
    this.#doc.append(text);
  }

  resetHistory(): void {
    this.#history.reset(this.#doc.tree.root);
  }

  gDelete(start: graphemes.Pos, end: graphemes.Pos): void {
    this.#gDoc.delete(start, end);
  }

  gInsert(pos: graphemes.Pos, text: string): void {
    this.#gDoc.insert(pos, text);
  }

  gRead(start: graphemes.Pos, end: graphemes.Pos): string {
    return this.#gDoc.read(start, end);
  }

  pushHistory(): void {
    this.#history.push(this.#doc.tree.root);
  }

  undo(): void {
    const entry = this.#history.undo();
    if (entry) {
      this.#doc.tree.root = entry;
    }
  }

  redo(): void {
    const entry = this.#history.redo();
    if (entry) {
      this.#doc.tree.root = entry;
    }
  }
}
