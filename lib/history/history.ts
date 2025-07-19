import { Buffer, Snapshot } from "@lib/buffer";
import { Cursor } from "@lib/cursor";

export class History {
  #entries: { ln: number; col: number; snapshot: Snapshot }[] = [];
  #index = -1;

  constructor(private buffer: Buffer, private cursor: Cursor) {
  }

  get has_changes(): boolean {
    return this.#index > 0;
  }

  reset(): void {
    const snapshot = this.buffer.get_snapshot();
    const { ln, col } = this.cursor;

    this.#entries = [{ ln, col, snapshot }];
    this.#index = 0;
  }

  push(): void {
    const snapshot = this.buffer.get_snapshot();
    const { ln, col } = this.cursor;

    this.#index += 1;
    this.#entries[this.#index] = { ln, col, snapshot };

    this.#entries.length = this.#index + 1;
  }

  undo(): void {
    if (this.#index > 0) {
      this.#index -= 1;

      this.#restore();
    }
  }

  redo(): void {
    if (this.#index < (this.#entries.length - 1)) {
      this.#index += 1;

      this.#restore();
    }
  }

  #restore(): void {
    const { ln, col, snapshot } = this.#entries[this.#index]!;

    this.buffer.set_snapshot(snapshot);
    this.cursor.set(ln, col, false);
  }
}
