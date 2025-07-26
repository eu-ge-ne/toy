import { Buffer } from "@lib/buffer";
import { Cursor } from "@lib/cursor";
import { GraphemePool } from "@lib/grapheme";
import { History } from "@lib/history";
import { Shaper } from "@lib/shaper";
import { Control } from "@lib/ui";

import { View } from "./view.ts";

interface EditorOptions {
  multi_line: boolean;
}

export class Editor extends Control {
  on_render?: (_: number) => void;
  on_cursor?: (_: { ln: number; col: number; ln_count: number }) => void;

  readonly buffer = new Buffer();
  readonly shaper: Shaper;
  readonly cursor: Cursor;
  readonly history: History;
  readonly view = new View(this);

  line_index_enabled = false;
  invisible_enabled = false;
  wrap_enabled = false;
  clipboard = "";

  constructor(
    readonly graphemes: GraphemePool,
    readonly opts: EditorOptions,
  ) {
    super();

    this.shaper = new Shaper(graphemes, this.buffer);
    this.cursor = new Cursor(this.shaper, this.buffer);
    this.history = new History(this.buffer, this.cursor);
    this.history.reset();
  }

  render(): void {
    const started = Date.now();

    this.view.render();
    this.on_cursor?.({ ...this.cursor, ln_count: this.buffer.ln_count });

    this.on_render?.(Date.now() - started);
  }

  reset(reset_cursor: boolean): void {
    if (reset_cursor) {
      if (this.opts.multi_line) {
        this.cursor.move(
          -Number.MAX_SAFE_INTEGER,
          -Number.MAX_SAFE_INTEGER,
          false,
        );
      } else {
        this.cursor.move(
          Number.MAX_SAFE_INTEGER,
          Number.MAX_SAFE_INTEGER,
          false,
        );
      }
    }

    this.history.reset();
  }

  insert(text: string): void {
    const { cursor, buffer, history } = this;

    if (cursor.selecting) {
      buffer.delete(cursor.from, cursor.to);
      cursor.set(...cursor.from, false);
    }

    const [ln, col] = buffer.insert([cursor.ln, cursor.col], text);

    if (ln === 0) {
      cursor.move(0, col, false);
    } else {
      cursor.set(cursor.ln + ln, col, false);
    }

    history.push();
  }

  backspace(): void {
    const { cursor, buffer, history } = this;

    if (cursor.ln > 0 && cursor.col === 0) {
      switch (buffer.line_length(cursor.ln)) {
        case 1: {
          buffer.delete([cursor.ln, cursor.col], [cursor.ln, cursor.col]);
          cursor.move(-1, Number.MAX_SAFE_INTEGER, false);
          break;
        }
        default: {
          cursor.move(-1, Number.MAX_SAFE_INTEGER, false);
          buffer.delete([cursor.ln, cursor.col], [cursor.ln, cursor.col]);
        }
      }
    } else {
      buffer.delete([cursor.ln, cursor.col - 1], [cursor.ln, cursor.col - 1]);
      cursor.move(0, -1, false);
    }

    history.push();
  }

  delete_char(): void {
    const { cursor, buffer, history } = this;

    buffer.delete([cursor.ln, cursor.col], [cursor.ln, cursor.col]);

    history.push();
  }

  delete_selection(): void {
    const { cursor, buffer, history } = this;

    buffer.delete(cursor.from, cursor.to);
    cursor.set(...cursor.from, false);

    history.push();
  }
}
