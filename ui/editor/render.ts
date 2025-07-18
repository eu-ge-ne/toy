import * as vt from "@lib/vt";
import {
  EDITOR_BG,
  EDITOR_BLANK_LINE_INDEX_COLORS,
  EDITOR_CHAR_COLORS,
  EDITOR_INVISIBLE_OFF_COLORS,
  EDITOR_INVISIBLE_ON_COLORS,
  EDITOR_LINE_INDEX_COLORS,
  EDITOR_SELECTED_CHAR_COLORS,
  EDITOR_SELECTED_INVISIBLE_COLORS,
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

    vt.begin_write(
      ...(enabled ? [] : [vt.cursor.save]),
      EDITOR_BG,
      ...vt.clear(y0, x0, h, w),
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
      vt.end_write(
        vt.cursor.show,
        vt.cursor.set(scroll.cursor_y, scroll.cursor_x),
      );
    } else {
      vt.end_write(vt.cursor.restore);
    }
  }

  #begin_ln(): vt.fmt.Span {
    const { x0, w } = this.#editor.area;
    vt.write(vt.cursor.set(this.#y, x0));
    return { len: w };
  }

  #end_ln(): boolean {
    const { y1 } = this.#editor.area;
    this.#y = Math.min(this.#y + 1, y1);
    return this.#y === y1;
  }

  // TODO: review
  #render_line(span: vt.fmt.Span): void {
    const { scroll, wrap_width, cursor, invisible_enabled } = this.#editor;

    this.#render_line_index(span);

    for (const { g, col, c, wrap } of this.#editor.line(this.#ln, wrap_width)) {
      if (wrap) {
        if (this.#end_ln()) {
          return;
        }
        span = this.#begin_ln();
        this.#blank_line_index(span);
      }

      if (c < scroll.col) {
        continue;
      }

      if (g.vt_width! > span.len) {
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

      vt.write(color, g.bytes);

      span.len -= g.vt_width!;
    }
  }

  #render_line_index(span: vt.fmt.Span): void {
    const { ln_index_width } = this.#editor;

    if (ln_index_width > 0) {
      vt.write(
        EDITOR_LINE_INDEX_COLORS,
        ...vt.fmt.lpad(span, ln_index_width, `${this.#ln + 1} `),
      );
    }
  }

  #blank_line_index(span: vt.fmt.Span): void {
    const { ln_index_width } = this.#editor;

    vt.write(
      EDITOR_BLANK_LINE_INDEX_COLORS,
      vt.fmt.space(span, ln_index_width),
    );
  }
}
