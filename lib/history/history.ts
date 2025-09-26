import { Buffer, Snapshot } from "@lib/buffer";
import { Cursor } from "@lib/cursor";

export class History {
  #index = -1;
  #entries: { ln: number; col: number; snapshot: Snapshot }[] = [];

  on_changed?: () => void;

  get is_empty(): boolean {
    return this.#index === 0;
  }

  constructor(private buffer: Buffer, private cursor: Cursor) {
    this.reset();
  }

  reset(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.buffer.save();

    this.#entries = [{ ln, col, snapshot }];
    this.#index = 0;

    this.on_changed?.();
  }

  push(): void {
    const { ln, col } = this.cursor;
    const snapshot = this.buffer.save();

    this.#index += 1;
    this.#entries[this.#index] = { ln, col, snapshot };
    this.#entries.length = this.#index + 1;

    this.on_changed?.();
  }

  undo(): boolean {
    if (this.#index <= 0) {
      return false;
    }

    this.#index -= 1;
    this.#restore();
    this.on_changed?.();

    return true;
  }

  redo(): boolean {
    if (this.#index >= (this.#entries.length - 1)) {
      return false;
    }

    this.#index += 1;
    this.#restore();
    this.on_changed?.();

    return true;
  }

  #restore(): void {
    const { ln, col, snapshot } = this.#entries[this.#index]!;

    this.buffer.restore(snapshot);
    this.cursor.set(ln, col, false);
  }
}
