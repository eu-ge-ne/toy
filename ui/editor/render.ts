import {
  begin_write,
  clear,
  end_write,
  fmt_lpad,
  fmt_space,
  restore_cursor,
  save_cursor,
  set_cursor,
  show_cursor,
  Span,
  vt_width,
  write,
} from "@lib/vt";
import {
  EDITOR_BG,
  EDITOR_BLANK_LINE_INDEX_COLORS,
  EDITOR_CHAR_COLORS,
  EDITOR_INVISIBLE_OFF_COLORS,
  EDITOR_INVISIBLE_ON_COLORS,
  EDITOR_LINE_INDEX_COLORS,
  EDITOR_SELECTED_CHAR_COLORS,
  EDITOR_SELECTED_INVISIBLE_COLORS,
  VT_WIDTH_COLORS,
} from "@ui/theme";

import { Editor } from "./editor.ts";

export class Render {
  #editor: Editor;

  #y = 0;
  #ln = 0;

  constructor(editor: Editor) {
    this.#editor = editor;
  }

  render(): void {
    const { buf, enabled, scroll } = this.#editor;
    const { y0, x0, h, w } = this.#editor.area;

    begin_write(
      ...(enabled ? [] : [save_cursor]),
      EDITOR_BG,
      ...clear(y0, x0, h, w),
    );

    this.#y = y0;
    this.#ln = scroll.ln;

    let span = { len: 0 };

    while (true) {
      span = this.#begin_ln();

      if (this.#ln < buf.ln_count) {
        this.#render_line(span);
      } else {
        this.#blank_line_index(span);
      }

      if (this.#end_ln()) {
        break;
      }

      this.#ln += 1;
    }

    if (enabled) {
      end_write(
        show_cursor,
        set_cursor(scroll.cursor_y, scroll.cursor_x),
      );
    } else {
      end_write(restore_cursor);
    }
  }

  #begin_ln(): Span {
    const { x0, w } = this.#editor.area;
    write(set_cursor(this.#y, x0));
    return { len: w };
  }

  #end_ln(): boolean {
    const { y1 } = this.#editor.area;
    this.#y = Math.min(this.#y + 1, y1);
    return this.#y === y1;
  }

  #render_line(span: Span): void {
    const { buf, scroll, wrap_width, cursor, invisible_enabled } = this.#editor;

    const start_col = scroll.col;

    this.#render_line_index(span);

    let col = 0;
    let x = 0;

    for (const g of buf.line_graphemes(this.#ln)) {
      if (typeof g.vt_width === "undefined") {
        end_write();
        g.vt_width = vt_width(VT_WIDTH_COLORS, g.bytes);
        begin_write();
      }

      if ((x + g.vt_width) > wrap_width) {
        if (this.#end_ln()) {
          return;
        }
        col = 0;
        x = 0;
        span = this.#begin_ln();
        this.#blank_line_index(span);
      }

      if (col < start_col) {
        col += 1;
        continue;
      }

      if (g.vt_width > span.len) {
        break;
      }

      let color: Uint8Array;

      if (cursor.is_selected(this.#ln, col)) {
        color = g.is_whitespace
          ? EDITOR_SELECTED_INVISIBLE_COLORS
          : EDITOR_SELECTED_CHAR_COLORS;
      } else {
        color = g.is_whitespace
          ? invisible_enabled
            ? EDITOR_INVISIBLE_ON_COLORS
            : EDITOR_INVISIBLE_OFF_COLORS
          : EDITOR_CHAR_COLORS;
      }

      write(color, g.bytes);

      span.len -= g.vt_width;

      col += 1;
      x += 1;
    }
  }

  #render_line_index(span: Span): void {
    const { ln_index_width } = this.#editor;

    if (ln_index_width > 0) {
      write(
        EDITOR_LINE_INDEX_COLORS,
        ...fmt_lpad(span, ln_index_width, `${this.#ln + 1} `),
      );
    }
  }

  #blank_line_index(span: Span): void {
    const { ln_index_width } = this.#editor;

    write(
      EDITOR_BLANK_LINE_INDEX_COLORS,
      fmt_space(span, ln_index_width),
    );
  }
}
