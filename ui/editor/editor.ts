import { Buffer } from "@lib/buffer";
import { Cursor } from "@lib/cursor";
import { GraphemePool } from "@lib/grapheme";
import { Key } from "@lib/input";
import { Shaper } from "@lib/shaper";
import { Area, Pane } from "@lib/ui";

import * as key from "./key/mod.ts";
import { History } from "./history.ts";
import { Render } from "./render.ts";
import { Scroll } from "./scroll.ts";

const LN_INDEX_WIDTH = 1 + 6 + 1;

interface EditorOptions {
  multi_line: boolean;
  show_ln_index: boolean;
}

export class Editor extends Pane {
  on_react?: (_: number) => void;
  on_render?: (_: number) => void;
  on_cursor?: (_: { ln: number; col: number; ln_count: number }) => void;
  on_change?: (_: boolean) => void;

  readonly shaper: Shaper;
  readonly cursor: Cursor;
  readonly buffer = new Buffer();
  readonly scroll = new Scroll(this);
  readonly history: History;
  #render = new Render(this);

  #handlers: key.KeyHandler[] = [
    new key.Left(this),
    new key.Right(this),
    new key.Home(this),
    new key.End(this),
    new key.Up(this),
    new key.Down(this),
    new key.PageUp(this),
    new key.PageDown(this),
    new key.Top(this),
    new key.Bottom(this),

    new key.SelectAll(this),
    new key.Copy(this),
    new key.Cut(this),
    new key.Paste(this),

    new key.Undo(this),
    new key.Redo(this),

    new key.Enter(this),
    new key.Tab(this),
    new key.Backspace(this),
    new key.Delete(this),
    new key.Center(this),
  ];

  ln_index_width = 0;

  invisible_enabled = false;
  wrap_enabled = false;
  wrap_width = Number.MAX_SAFE_INTEGER;

  clipboard = "";

  constructor(
    readonly graphemes: GraphemePool,
    readonly opts: EditorOptions,
  ) {
    super();

    this.shaper = new Shaper(graphemes, this.buffer);
    this.cursor = new Cursor(this.shaper, this.buffer);
    this.history = new History(this);

    this.ln_index_width = opts.show_ln_index ? LN_INDEX_WIDTH : 0;
  }

  override resize(area: Area): void {
    super.resize(area);

    this.wrap_width = this.wrap_enabled
      ? this.area.w - this.ln_index_width
      : Number.MAX_SAFE_INTEGER;
  }

  render(): void {
    const started = Date.now();

    this.scroll.scroll();
    this.#render.render();
    this.on_cursor?.({ ...this.cursor, ln_count: this.buffer.ln_count });

    this.on_render?.(Date.now() - started);
  }

  reset(): void {
    if (this.opts.multi_line) {
      this.cursor.move(
        -Number.MAX_SAFE_INTEGER,
        -Number.MAX_SAFE_INTEGER,
        false,
      );
    } else {
      this.cursor.move(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, false);
    }

    this.history.reset();
  }

  on_key(key: Key | string): void {
    if (!this.enabled) {
      return;
    }

    const started = Date.now();

    try {
      if (typeof key === "string") {
        this.insert(key);
        this.render();
        return;
      }

      if (typeof key.text === "string") {
        this.insert(key.text);
        this.render();
        return;
      }

      const handler = this.#handlers.find((x) => x.match(key));
      if (handler) {
        handler.handle(key);
        this.render();
      }
    } finally {
      this.on_react?.(Date.now() - started);
    }
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

  toggle_invisible(): void {
    this.invisible_enabled = !this.invisible_enabled;
  }

  toggle_wrap(): void {
    this.wrap_enabled = !this.wrap_enabled;

    this.cursor.move(0, -Number.MAX_SAFE_INTEGER, false);
  }
}
