export class History<T> {
  #entries: T[] = [];
  #i!: number;

  reset(entry: T): void {
    this.#entries = [structuredClone(entry)];
    this.#i = 0;
  }

  push(entry: T): void {
    this.#i += 1;
    this.#entries[this.#i] = structuredClone(entry);
    this.#entries.length = this.#i + 1;
  }

  undo(): T | undefined {
    if (this.#i > 0) {
      this.#i -= 1;

      return structuredClone(this.#entries[this.#i]!);
    }
  }

  redo(): T | undefined {
    if (this.#i < (this.#entries.length - 1)) {
      this.#i += 1;

      return structuredClone(this.#entries[this.#i]!);
    }
  }
}
