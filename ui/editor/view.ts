import { range, sum } from "@lib/std";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";
import { Editor } from "./editor.ts";

export class View {
  #index_width!: number;
  #text_width!: number;
  #wrap_width!: number;

  #scroll_ln = 0;
  #scroll_col = 0;
  #cursor_y = 0;
  #cursor_x = 0;

  #y = 0;

  get #y_end(): boolean {
    const { y, h } = this.editor;
    return this.#y >= y + h;
  }

  readonly #x_span: vt.fmt.Span = { len: 0 };

  constructor(private editor: Editor) {
  }

  render(): void {
    const { y, x, buffer, shaper, enabled } = this.editor;

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...vt.clear(this.editor),
    );

    this.#layout();

    shaper.y = this.#cursor_y = y;
    shaper.x = this.#cursor_x = x + this.#index_width;

    this.#scroll_v();
    this.#scroll_h();

    this.#y = y;

    for (let ln = this.#scroll_ln;; ln += 1) {
      if (ln < buffer.ln_count) {
        this.#render_line(ln);
      } else {
        this.#begin_line();

        vt.write_buf(
          colors.VOID,
          vt.fmt.space(this.#x_span, this.#x_span.len),
        );
      }

      this.#y += 1;

      if (this.#y_end) {
        break;
      }
    }

    vt.flush_buf(
      enabled
        ? vt.cursor.set(this.#cursor_y, this.#cursor_x)
        : vt.cursor.restore,
      vt.cursor.show,
    );

    vt.esu();
  }

  #layout(): void {
    const { buffer, wrap_enabled, line_index_enabled } = this.editor;

    if (line_index_enabled && buffer.ln_count > 0) {
      this.#index_width = Math.trunc(Math.log10(buffer.ln_count)) + 3;
    } else {
      this.#index_width = 0;
    }

    this.#text_width = this.editor.w - this.#index_width;

    this.#wrap_width = wrap_enabled
      ? this.#text_width
      : Number.MAX_SAFE_INTEGER;
  }

  #begin_line(): void {
    vt.write_buf(
      vt.cursor.set(this.#y, this.editor.x),
    );

    this.#x_span.len = this.editor.w;
  }

  #render_line(ln: number): void {
    const { shaper, cursor, whitespace_enabled } = this.editor;

    let current_color!: Uint8Array;

    const xs = shaper.wrap_line(ln, this.#wrap_width);

    for (const { i, col, grapheme: { width, is_visible, bytes } } of xs) {
      if (col === 0) {
        if (i === 0) {
          this.#begin_line();

          if (this.#index_width > 0) {
            vt.write_buf(
              colors.INDEX,
              ...vt.fmt.text(
                this.#x_span,
                `${ln + 1} `.padStart(this.#index_width),
              ),
            );
          }
        } else {
          this.#y += 1;
          if (this.#y_end) {
            return;
          }

          this.#begin_line();

          if (this.#index_width > 0) {
            vt.write_buf(
              colors.BACKGROUND,
              vt.fmt.space(this.#x_span, this.#index_width),
            );
          }
        }
      }

      if ((col < this.#scroll_col) || (width > this.#x_span.len)) {
        continue;
      }

      let color!: Uint8Array;
      {
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
      }

      if (current_color !== color) {
        current_color = color;
        vt.write_buf(color);
      }

      vt.write_buf(bytes);

      this.#x_span.len -= width;
    }
  }

  #scroll_v(): void {
    const { shaper, cursor, h } = this.editor;

    const delta_ln = cursor.ln - this.#scroll_ln;

    // Did the cursor move above the scroll line?
    if (delta_ln <= 0) {
      this.#scroll_ln = cursor.ln;
      return;
    }

    // Did the cursor move below the scroll area?

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

    // Did the cursor move to the left of the scroll column?
    if (delta_col <= 0) {
      this.#scroll_col = c;
      return;
    }

    // Did the cursor move to the right of the scroll area?

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
