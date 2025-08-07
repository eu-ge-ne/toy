import { Buffer } from "@lib/buffer";
import { Cursor } from "@lib/cursor";
import { Grapheme, graphemes } from "@lib/grapheme";
import { History } from "@lib/history";
import { range, sum } from "@lib/std";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

import * as keys from "./keys/mod.ts";
import * as colors from "./colors.ts";

interface EditorOptions {
  multi_line: boolean;
}

interface Cell {
  grapheme: Grapheme;
  i: number;
  ln: number;
  col: number;
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
  readonly cursor = new Cursor(this.buffer);
  readonly history = new History(this.buffer, this.cursor);

  line_index_enabled = false;
  whitespace_enabled = false;
  wrap_enabled = false;
  clipboard = "";

  constructor(
    parent: Control,
    readonly opts: EditorOptions,
  ) {
    super(parent);

    this.history.reset();
  }

  layout({ y, x, w, h }: Area): void {
    this.y = y;
    this.x = x;

    this.w = w;
    this.h = h;
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

  handle_input(key: vt.Key | string): boolean {
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

  #ln_count = -1;
  private index_width!: number;
  private index_blank!: Uint8Array;
  private text_width!: number;
  private wrap_width!: number;
  #y = 0;

  render(): void {
    const t0 = performance.now();

    const {
      y,
      x,
      w,
      enabled,
      wrap_enabled,
      line_index_enabled,
      buffer: { ln_count },
    } = this;

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...vt.clear_area(this),
    );

    if (line_index_enabled && ln_count > 0) {
      if (this.#ln_count !== ln_count) {
        this.#ln_count = ln_count;
        this.index_width = Math.trunc(Math.log10(ln_count)) + 3;
        this.index_blank = vt.fmt.spaces(this.index_width);
      }
    } else {
      this.index_width = 0;
    }

    this.text_width = w - this.index_width;

    this.wrap_width = wrap_enabled ? this.text_width : Number.MAX_SAFE_INTEGER;

    this.measure_y = this.#cursor_y = y;
    this.measure_x = this.#cursor_x = x + this.index_width;

    if (w >= this.index_width) {
      this.#render_lines();
    }

    vt.flush_buf(
      enabled
        ? vt.cursor.set(this.#cursor_y, this.#cursor_x)
        : vt.cursor.restore,
      vt.cursor.show,
    );

    vt.esu();

    this.on_cursor?.({ ...this.cursor, ln_count: this.buffer.ln_count });

    const t1 = performance.now();
    this.on_render?.(t1 - t0);
  }

  #next_y(): boolean {
    this.#y += 1;
    return this.#y < this.y + this.h;
  }

  #render_lines(): void {
    const { y, x, w, buffer: { ln_count } } = this;

    this.#scroll_v();
    this.#scroll_h();

    this.#y = y;

    for (let ln = this.#scroll_ln;; ln += 1) {
      if (ln < ln_count) {
        this.#render_line(ln);
      } else {
        vt.write_buf(
          vt.cursor.set(this.#y, x),
          colors.VOID,
          vt.clear_line(w),
        );
      }

      if (!this.#next_y()) {
        break;
      }
    }
  }

  #render_line(ln: number): void {
    const { cursor, whitespace_enabled } = this;

    let available_w = 0;
    let current_color!: Uint8Array;

    const xs = this.#cells(ln, false);

    for (const { i, col, grapheme: { width, is_visible, bytes } } of xs) {
      if (col === 0) {
        if (i > 0) {
          if (!this.#next_y()) {
            return;
          }
        }

        vt.write_buf(
          vt.cursor.set(this.#y, this.x),
        );

        if (this.index_width > 0) {
          if (i === 0) {
            vt.write_buf(
              colors.INDEX,
              vt.fmt.text(`${ln + 1} `.padStart(this.index_width)),
            );
          } else {
            vt.write_buf(
              colors.BACKGROUND,
              this.index_blank,
            );
          }
        }

        available_w = this.w - this.index_width;
      }

      if ((col < this.#scroll_col) || (width > available_w)) {
        continue;
      }

      {
        let color!: Uint8Array;

        const { Char, Whitespace, Empty } = cursor.is_selected(ln, i)
          ? colors.SELECTED
          : colors.CHAR;

        if (is_visible) {
          color = Char;
        } else if (whitespace_enabled) {
          color = Whitespace;
        } else {
          color = Empty;
        }

        if (current_color !== color) {
          current_color = color;
          vt.write_buf(color);
        }
      }

      vt.write_buf(bytes);

      available_w -= width;
    }
  }

  #scroll_ln = 0;
  #cursor_y = 0;

  #scroll_v(): void {
    const { cursor, h } = this;

    const delta_ln = cursor.ln - this.#scroll_ln;

    // Above?
    if (delta_ln <= 0) {
      this.#scroll_ln = cursor.ln;
      return;
    }

    // Below?

    if (delta_ln > h) {
      this.#scroll_ln = cursor.ln - h;
    }

    const hh = range(this.#scroll_ln, cursor.ln + 1).map((ln) =>
      this.#cells(ln, false).reduce(
        (a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0),
        1,
      )
    );

    let i = 0;

    for (let height = sum(hh); height > h; i += 1) {
      height -= hh[i]!;
      this.#scroll_ln += 1;
    }

    for (; i < hh.length - 1; i += 1) {
      this.#cursor_y += hh[i]!;
    }
  }

  #scroll_col = 0;
  #cursor_x = 0;

  #scroll_h(): void {
    const { cursor } = this;

    const cell = this.#cells(cursor.ln, true).drop(cursor.col).next().value;
    if (cell) {
      this.#cursor_y += cell.ln;
    }

    const c = cell?.col ?? 0; // c = f(cursor.col)
    const delta_col = c - this.#scroll_col;

    // Before?
    if (delta_col <= 0) {
      this.#scroll_col = c;
      return;
    }

    // After?

    const line = this.#cells(cursor.ln, true).toArray();
    const ww = line.slice(cursor.col - delta_col, cursor.col).map((x) =>
      x.grapheme.width
    );

    let width = sum(ww);

    for (const w of ww) {
      if (width < this.text_width) {
        break;
      }

      this.#scroll_col += 1;
      width -= w;
    }

    this.#cursor_x += width;
  }

  private measure_y!: number;
  private measure_x!: number;

  *#cells(ln: number, with_tail: boolean): Generator<Cell> {
    const { buffer, measure_y, measure_x, wrap_width } = this;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const seg of buffer.line(ln)) {
      const grapheme = graphemes.get(seg);

      if (grapheme.width < 0) {
        grapheme.width = vt.cursor.measure(
          measure_y,
          measure_x,
          grapheme.bytes,
        );
      }

      w += grapheme.width;
      if (w > wrap_width) {
        w = grapheme.width;
        l += 1;
        c = 0;
      }

      yield { grapheme, i, ln: l, col: c };

      i += 1;
      c += 1;
    }

    if (with_tail) {
      const grapheme = graphemes.get(" ");

      w += grapheme.width;
      if (w > wrap_width) {
        w = grapheme.width;
        l += 1;
        c = 0;
      }

      yield { grapheme, i, ln: l, col: c };
    }
  }
}
