import { Snapshot } from "@lib/buffer";

import { Editor } from "./editor.ts";

export class History {
  #entries: { ln: number; col: number; snapshot: Snapshot }[] = [];
  #index = -1;

  constructor(private editor: Editor) {
    this.reset();
  }

  get #has_changes(): boolean {
    return this.#index > 0;
  }

  reset(): void {
    const { cursor: { ln, col }, buffer } = this.editor;
    const snapshot = buffer.get_snapshot();

    this.#entries = [{ ln, col, snapshot }];
    this.#index = 0;

    this.editor.on_change?.(this.#has_changes);
  }

  push(): void {
    const { cursor: { ln, col }, buffer } = this.editor;
    const snapshot = buffer.get_snapshot();

    this.#index += 1;
    this.#entries[this.#index] = { ln, col, snapshot };

    this.#entries.length = this.#index + 1;

    this.editor.on_change?.(this.#has_changes);
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
    const { cursor, buffer } = this.editor;

    const { ln, col, snapshot } = this.#entries[this.#index]!;

    buffer.set_snapshot(snapshot);
    cursor.set(ln, col, false);

    this.editor.on_change?.(this.#has_changes);
  }
}
