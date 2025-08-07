import { Grapheme, graphemes } from "@lib/grapheme";
import { range, sum } from "@lib/std";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";
import { Editor } from "./editor.ts";

interface Cell {
  grapheme: Grapheme;
  i: number;
  ln: number;
  col: number;
}

export class View {
  constructor(private editor: Editor) {
  }

  render(): void {
    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...vt.clear_area(this.editor),
    );

    this.#layout();

    if (this.editor.w >= this.#index_width) {
      this.#render_lines();
    }

    vt.flush_buf(
      this.editor.enabled
        ? vt.cursor.set(this.#cursor_y, this.#cursor_x)
        : vt.cursor.restore,
      vt.cursor.show,
    );

    vt.esu();
  }

  #ln_count = -1;
  #index_width!: number;
  #index_blank!: Uint8Array;
  #text_width!: number;
  #wrap_width!: number;

  #layout(): void {
    const {
      y,
      x,
      w,
      wrap_enabled,
      line_index_enabled,
      buffer: { ln_count },
    } = this.editor;

    if (line_index_enabled && ln_count > 0) {
      if (this.#ln_count !== ln_count) {
        this.#ln_count = ln_count;
        this.#index_width = Math.trunc(Math.log10(ln_count)) + 3;
        this.#index_blank = vt.fmt.spaces(this.#index_width);
      }
    } else {
      this.#index_width = 0;
    }

    this.#text_width = w - this.#index_width;

    this.#wrap_width = wrap_enabled
      ? this.#text_width
      : Number.MAX_SAFE_INTEGER;

    this.#cursor_y = y;
    this.#cursor_x = x + this.#index_width;
  }

  #y = 0;

  #next_y(): boolean {
    this.#y += 1;
    return this.#y < this.editor.y + this.editor.h;
  }

  #render_lines(): void {
    const { y, x, w, buffer: { ln_count } } = this.editor;

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
    const { cursor, whitespace_enabled } = this.editor;

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
          vt.cursor.set(this.#y, this.editor.x),
        );

        if (this.#index_width > 0) {
          if (i === 0) {
            vt.write_buf(
              colors.INDEX,
              vt.fmt.text(`${ln + 1} `.padStart(this.#index_width)),
            );
          } else {
            vt.write_buf(
              colors.BACKGROUND,
              this.#index_blank,
            );
          }
        }

        available_w = this.editor.w - this.#index_width;
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
    const { cursor, h } = this.editor;

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
    const { cursor } = this.editor;

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
      if (width < this.#text_width) {
        break;
      }

      this.#scroll_col += 1;
      width -= w;
    }

    this.#cursor_x += width;
  }

  *#cells(ln: number, with_tail: boolean): Generator<Cell> {
    const { y, x, buffer } = this.editor;
    const wrap_width = this.#wrap_width;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const seg of buffer.line(ln)) {
      const grapheme = graphemes.get(seg);

      if (grapheme.width < 0) {
        grapheme.width = vt.cursor.measure(
          y,
          x + this.#index_width,
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
