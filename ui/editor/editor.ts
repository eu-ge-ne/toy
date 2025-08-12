import { Buffer } from "@lib/buffer";
import { Cursor } from "@lib/cursor";
import { Grapheme, graphemes } from "@lib/grapheme";
import { History } from "@lib/history";
import { range, sum } from "@lib/std";
import { Area, clear, Control, render } from "@lib/ui";
import * as vt from "@lib/vt";

import * as keys from "./keys/mod.ts";
import * as colors from "./colors.ts";

interface EditorOptions {
  multi_line: boolean;
}

interface Cell {
  grm: Grapheme;
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

  index_enabled = false;
  whitespace_enabled = false;
  wrap_enabled = false;
  clipboard = "";

  constructor(parent: Control, readonly opts: EditorOptions) {
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

  #sgr = new Intl.Segmenter();

  insert(text: string): void {
    const { cursor, buffer, history } = this;

    if (cursor.selecting) {
      buffer.seg_delete(cursor.from, cursor.to);
      cursor.set(cursor.from.ln, cursor.from.col, false);
    }

    buffer.seg_insert(cursor, text);

    const grms = [...this.#sgr.segment(text)].map((x) =>
      graphemes.get(x.segment)
    );
    const eol_count = grms.filter((x) => x.is_eol).length;

    if (eol_count === 0) {
      cursor.move(0, grms.length, false);
    } else {
      const col = grms.length - grms.findLastIndex((x) => x.is_eol) - 1;
      cursor.set(cursor.ln + eol_count, col, false);
    }

    history.push();
  }

  backspace(): void {
    const { cursor, buffer, history } = this;

    if (cursor.ln > 0 && cursor.col === 0) {
      const len = buffer.seg_line(cursor.ln).take(2).reduce((a) => a + 1, 0);
      switch (len) {
        case 1: {
          buffer.seg_delete(cursor, cursor);
          cursor.move(-1, Number.MAX_SAFE_INTEGER, false);
          break;
        }
        default: {
          cursor.move(-1, Number.MAX_SAFE_INTEGER, false);
          buffer.seg_delete(cursor, cursor);
        }
      }
    } else {
      buffer.seg_delete(
        { ln: cursor.ln, col: cursor.col - 1 },
        { ln: cursor.ln, col: cursor.col - 1 },
      );
      cursor.move(0, -1, false);
    }

    history.push();
  }

  delete_char(): void {
    const { cursor, buffer, history } = this;

    buffer.seg_delete(cursor, cursor);

    history.push();
  }

  delete_selection(): void {
    const { cursor, buffer, history } = this;

    buffer.seg_delete(cursor.from, cursor.to);
    cursor.set(cursor.from.ln, cursor.from.col, false);

    history.push();
  }

  #ln_count = -1;
  private index_width = 0;
  private index_blank!: Uint8Array;
  private text_width = 0;
  private wrap_width = 0;
  private cursor_y = 0;
  private cursor_x = 0;
  private measure_y = 0;
  private measure_x = 0;
  private scroll_ln = 0;
  private scroll_col = 0;

  render(): void {
    const t0 = performance.now();

    const {
      y,
      x,
      w,
      enabled,
      wrap_enabled,
      index_enabled,
      buffer: { ln_count },
    } = this;

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...clear.area(this),
    );

    if (index_enabled && ln_count > 0) {
      if (this.#ln_count !== ln_count) {
        this.#ln_count = ln_count;
        this.index_width = Math.trunc(Math.log10(ln_count)) + 3;
        this.index_blank = render.space(this.index_width);
      }
    } else {
      this.index_width = 0;
    }

    this.text_width = w - this.index_width;
    this.wrap_width = wrap_enabled ? this.text_width : Number.MAX_SAFE_INTEGER;

    this.measure_y = this.cursor_y = y;
    this.measure_x = this.cursor_x = x + this.index_width;

    if (w >= this.index_width) {
      this.#render_lines();
    }

    vt.flush_buf(
      enabled ? vt.cursor.set(this.cursor_y, this.cursor_x) : vt.cursor.restore,
      vt.cursor.show,
    );

    vt.esu();

    this.on_cursor?.({ ...this.cursor, ln_count: this.buffer.ln_count });

    const t1 = performance.now();
    this.on_render?.(t1 - t0);
  }

  #render_lines(): void {
    const { y, x, w, h, buffer: { ln_count } } = this;

    this.#scroll_v();
    this.#scroll_h();

    let row = y;

    for (let ln = this.scroll_ln;; ln += 1) {
      if (ln < ln_count) {
        row = this.#render_line(ln, row);
      } else {
        vt.write_buf(
          vt.cursor.set(row, x),
          colors.VOID,
          clear.line(w),
        );
      }

      row += 1;
      if (row >= y + h) {
        break;
      }
    }
  }

  #render_line(ln: number, row: number): number {
    const { y, h, cursor, whitespace_enabled } = this;

    let available_w = 0;
    let current_color!: Uint8Array;

    const xs = this.#cells(ln, false);

    for (const { grm: { width, is_visible, bytes }, i, col } of xs) {
      if (col === 0) {
        if (i > 0) {
          row += 1;
          if (row >= y + h) {
            return row;
          }
        }

        vt.write_buf(
          vt.cursor.set(row, this.x),
        );

        if (this.index_width > 0) {
          if (i === 0) {
            vt.write_buf(
              colors.INDEX,
              render.txt(`${ln + 1} `.padStart(this.index_width)),
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

      if ((col < this.scroll_col) || (width > available_w)) {
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

    return row;
  }

  #scroll_v(): void {
    const { cursor, h } = this;

    const delta_ln = cursor.ln - this.scroll_ln;

    // Above?
    if (delta_ln <= 0) {
      this.scroll_ln = cursor.ln;
      return;
    }

    // Below?

    if (delta_ln > h) {
      this.scroll_ln = cursor.ln - h;
    }

    const xs = range(this.scroll_ln, cursor.ln + 1).map((ln) =>
      this.#cells(ln, false).reduce(
        (a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0),
        1,
      )
    );

    let i = 0;

    for (let height = sum(xs); height > h; i += 1) {
      height -= xs[i]!;
      this.scroll_ln += 1;
    }

    for (; i < xs.length - 1; i += 1) {
      this.cursor_y += xs[i]!;
    }
  }

  #scroll_h(): void {
    const { cursor } = this;

    const cell = this.#cells(cursor.ln, true).drop(cursor.col).next().value;
    if (cell) {
      this.cursor_y += cell.ln;
    }

    const col = cell?.col ?? 0; // col = f(cursor.col)
    const delta_col = col - this.scroll_col;

    // Before?
    if (delta_col <= 0) {
      this.scroll_col = col;
      return;
    }

    // After?

    const xs = this.#cells(cursor.ln, true)
      .drop(cursor.col - delta_col)
      .take(delta_col)
      .map((x) => x.grm.width)
      .toArray();

    let width = sum(xs);

    for (const w of xs) {
      if (width < this.text_width) {
        break;
      }

      this.scroll_col += 1;
      width -= w;
    }

    this.cursor_x += width;
  }

  *#cells(line: number, with_tail: boolean): Generator<Cell> {
    const { buffer, measure_y, measure_x, wrap_width } = this;

    let i = 0;
    let w = 0;
    let ln = 0;
    let col = 0;

    for (const seg of buffer.seg_line(line)) {
      const grm = graphemes.get(seg);

      if (grm.width < 0) {
        grm.width = vt.cursor.measure(measure_y, measure_x, grm.bytes);
      }

      w += grm.width;
      if (w > wrap_width) {
        w = grm.width;
        ln += 1;
        col = 0;
      }

      yield { grm, i, ln, col };

      i += 1;
      col += 1;
    }

    if (with_tail) {
      const grm = graphemes.get(" ");

      w += grm.width;
      if (w > wrap_width) {
        w = grm.width;
        ln += 1;
        col = 0;
      }

      yield { grm, i, ln, col };
    }
  }
}
