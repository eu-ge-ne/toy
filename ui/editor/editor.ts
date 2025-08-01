import { Buffer } from "@lib/buffer";
import { Cursor } from "@lib/cursor";
import { History } from "@lib/history";
import { Shaper } from "@lib/shaper";
import { Control } from "@lib/ui";
import { Key } from "@lib/vt";

import * as keys from "./keys/mod.ts";
import { View } from "./view.ts";

interface EditorOptions {
  multi_line: boolean;
}

export class Editor extends Control {
  #handlers: keys.KeyHandler[] = [
    new keys.TextHandler(this),
    new keys.BackspaceHandler(this),
    new keys.BottomHandler(this),
    new keys.CopyHandler(this),
    new keys.CutHandler(this),
    new keys.DeleteHandler(this),
    new keys.DownHandler(this),
    new keys.EndHandler(this),
    new keys.EnterHandler(this),
    new keys.HomeHandler(this),
    new keys.LeftHandler(this),
    new keys.PageDownHandler(this),
    new keys.PageUpHandler(this),
    new keys.PasteHandler(this),
    new keys.RedoHandler(this),
    new keys.RightHandler(this),
    new keys.SelectAllHandler(this),
    new keys.TabHandler(this),
    new keys.TopHandler(this),
    new keys.UndoHandler(this),
    new keys.UpHandler(this),
  ];

  on_input_handled?: (_: number) => void;
  on_render?: (_: number) => void;
  on_cursor?: (_: { ln: number; col: number; ln_count: number }) => void;

  readonly buffer = new Buffer();
  readonly shaper: Shaper;
  readonly cursor: Cursor;
  readonly history: History;
  readonly view = new View(this);

  line_index_enabled = false;
  whitespace_enabled = false;
  wrap_enabled = false;
  clipboard = "";

  constructor(
    parent: Control,
    readonly opts: EditorOptions,
  ) {
    super(parent);

    this.shaper = new Shaper(this.buffer);
    this.cursor = new Cursor(this.shaper, this.buffer);
    this.history = new History(this.buffer, this.cursor);
    this.history.reset();
  }

  render(): void {
    const t0 = performance.now();

    this.view.render();
    this.on_cursor?.({ ...this.cursor, ln_count: this.buffer.ln_count });

    const t1 = performance.now();
    this.on_render?.(t1 - t0);
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

  handle_input(key: Key | string): boolean {
    const t0 = performance.now();

    const handled = this.#handlers.find((x) => x.match(key))
      ?.handle(key) ?? false;

    const t1 = performance.now();
    this.on_input_handled?.(t1 - t0);

    return handled;
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
