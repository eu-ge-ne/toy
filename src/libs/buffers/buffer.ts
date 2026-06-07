import * as documents from "@libs/documents";
import * as events from "@libs/events";
import * as graphemes from "@libs/graphemes";
import * as history from "@libs/history";

export class Buffer {
  readonly #doc = new documents.Document();
  readonly #gDoc = new graphemes.Document(this.#doc);
  readonly #history = new history.History<documents.Node>();
  readonly #emitter = new events.SignalEmitter<{
    "change": () => void;
    "change.name": () => void;
  }>();

  #name = "";

  constructor() {
    this.resetUndo();
  }

  readonly signals = this.#emitter.listener;

  get name(): string {
    return this.#name;
  }

  set name(x: string) {
    this.#name = x;
    this.#emitter.broadcast("change.name");
  }

  get lineCount(): number {
    return this.#doc.lineCount;
  }

  get modified(): boolean {
    return !this.#history.empty;
  }

  get text(): string {
    return this.#doc.text;
  }

  set text(x: string) {
    this.#doc.text = x;

    this.resetUndo();
  }

  async rewrite(text: AsyncIterable<string>): Promise<void> {
    await this.#doc.rewrite(text);

    this.resetUndo();
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

  edit(
    fn: (
      _: {
        insert: (pos: graphemes.Pos, text: string) => void;
        remove: (start: graphemes.Pos, end: graphemes.Pos) => void;
      },
    ) => void,
  ): void {
    let changed = false;

    fn({
      insert: (pos: graphemes.Pos, text: string) => {
        this.#gDoc.insert(pos, text);
        changed = true;
      },
      remove: (start: graphemes.Pos, end: graphemes.Pos) => {
        this.#gDoc.delete(start, end);
        changed = true;
      },
    });

    if (changed) {
      this.#history.push(this.#doc.tree.root);

      this.#emitter.broadcast("change");
    }
  }

  undo(): void {
    const entry = this.#history.undo();
    if (!entry) {
      return;
    }

    this.#doc.tree.root = entry;

    this.#emitter.broadcast("change");
  }

  redo(): void {
    const entry = this.#history.redo();
    if (!entry) {
      return;
    }

    this.#doc.tree.root = entry;

    this.#emitter.broadcast("change");
  }

  resetUndo(): void {
    this.#history.reset(this.#doc.tree.root);

    this.#emitter.broadcast("change");
  }
}
