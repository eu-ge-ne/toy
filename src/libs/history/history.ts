export class History<T extends { clone(): T }> {
  #entries: T[] = [];
  #i!: number;

  get empty(): boolean {
    return this.#i < 1;
  }

  reset(entry: T): void {
    this.#entries = [entry.clone()];

    this.#i = 0;
  }

  push(entry: T): void {
    this.#i += 1;

    this.#entries[this.#i] = entry.clone();
    this.#entries.length = this.#i + 1;
  }

  undo(): T | undefined {
    if (this.#i > 0) {
      this.#i -= 1;

      return this.#entries[this.#i]!.clone();
    }
  }

  redo(): T | undefined {
    if (this.#i < (this.#entries.length - 1)) {
      this.#i += 1;

      return this.#entries[this.#i]!.clone();
    }
  }
}
