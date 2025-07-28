import { Buffer, Snapshot } from "@lib/buffer";
import { Cursor } from "@lib/cursor";

export class History {
  #entries: {
    ln: number;
    col: number;
    snapshot: Snapshot;
  }[] = [];

  #index = -1;

  on_changed?: (_: number) => void;

  constructor(
    private buffer: Buffer,
    private cursor: Cursor,
  ) {
  }

  reset(): void {
    const snapshot = this.buffer.get_snapshot();
    const { ln, col } = this.cursor;

    this.#entries = [{ ln, col, snapshot }];
    this.#index = 0;

    this.on_changed?.(this.#index);
  }

  push(): void {
    const snapshot = this.buffer.get_snapshot();
    const { ln, col } = this.cursor;

    this.#index += 1;
    this.#entries[this.#index] = { ln, col, snapshot };
    this.#entries.length = this.#index + 1;

    this.on_changed?.(this.#index);
  }

  undo(): boolean {
    if (this.#index > 0) {
      this.#index -= 1;
      this.#restore();

      this.on_changed?.(this.#index);

      return true;
    }

    return false;
  }

  redo(): boolean {
    if (this.#index < (this.#entries.length - 1)) {
      this.#index += 1;
      this.#restore();

      this.on_changed?.(this.#index);

      return true;
    }

    return false;
  }

  #restore(): void {
    const { ln, col, snapshot } = this.#entries[this.#index]!;

    this.buffer.set_snapshot(snapshot);
    this.cursor.set(ln, col, false);
  }
}
