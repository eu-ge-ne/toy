import { range, sum } from "@lib/std";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";
import { Editor } from "./editor.ts";

export class View {
  constructor(private editor: Editor) {
  }

  render(): void {
    const { w, enabled } = this.editor;

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...vt.clear_area(this.editor),
    );

    this.#layout();

    if (w >= this.#index_width) {
      this.#render_lines();
    }

    vt.flush_buf(
      enabled
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
    const { buffer, wrap_enabled, line_index_enabled } = this.editor;

    if (line_index_enabled && buffer.ln_count > 0) {
      if (this.#ln_count !== buffer.ln_count) {
        this.#ln_count = buffer.ln_count;
        this.#index_width = Math.trunc(Math.log10(buffer.ln_count)) + 3;
        this.#index_blank = vt.fmt.spaces(this.#index_width);
      }
    } else {
      this.#index_width = 0;
    }

    this.#text_width = this.editor.w - this.#index_width;

    this.#wrap_width = wrap_enabled
      ? this.#text_width
      : Number.MAX_SAFE_INTEGER;
  }

  #y = 0;

  #next_y(): boolean {
    this.#y += 1;
    return this.#y < this.editor.y + this.editor.h;
  }

  #render_lines(): void {
    const { y, x, buffer, shaper } = this.editor;

    shaper.y = this.#cursor_y = y;
    shaper.x = this.#cursor_x = x + this.#index_width;

    this.#scroll_v();
    this.#scroll_h();

    this.#y = y;

    for (let ln = this.#scroll_ln;; ln += 1) {
      if (ln < buffer.ln_count) {
        this.#render_line(ln);
      } else {
        vt.write_buf(
          vt.cursor.set(this.#y, this.editor.x),
          colors.VOID,
          vt.clear_line(this.editor.w),
        );
      }

      if (!this.#next_y()) {
        break;
      }
    }
  }

  #render_line(ln: number): void {
    const { shaper, cursor, whitespace_enabled } = this.editor;

    let available_w = 0;
    let current_color!: Uint8Array;

    const xs = shaper.wrap_line(ln, this.#wrap_width);

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
    const { shaper, cursor, h } = this.editor;

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

    const hh = range(this.#scroll_ln, cursor.ln + 1).map((i) =>
      shaper.count_wraps(i, this.#wrap_width)
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
    const { shaper, cursor } = this.editor;

    let c = 0; // c = f(cursor.col)

    // TODO: optimize
    const line = shaper.wrap_line(cursor.ln, this.#wrap_width, true).toArray();
    if (line.length > 0) {
      const cell = line[cursor.col];
      if (cell) {
        c = cell.col;
        this.#cursor_y += cell.ln;
      }
    }

    const delta_col = c - this.#scroll_col;

    // Before?
    if (delta_col <= 0) {
      this.#scroll_col = c;
      return;
    }

    // After?

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
}
