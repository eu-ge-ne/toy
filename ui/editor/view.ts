import { range, sum } from "@lib/std";
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

export class View {
  #index_width!: number;
  #text_width!: number;
  #wrap_width!: number;

  #scroll_ln = 0;
  #scroll_col = 0;
  #cursor_y = 0;
  #cursor_x = 0;

  #y = 0;
  #ln = 0;

  constructor(private editor: Editor) {
  }

  render(): void {
    const { buffer, enabled, area, opts, wrap_enabled } = this.editor;

    this.#index_width = opts.show_ln_index ? Math.ceil(Math.log10(buffer.ln_count + 1)) + 2 : 0;
    this.#text_width = area.w - this.#index_width;
    this.#wrap_width = wrap_enabled ? this.#text_width : Number.MAX_SAFE_INTEGER;

    this.#cursor_y = area.y0;
    this.#cursor_x = area.x0 + this.#index_width;

    this.#scroll_vertical();
    this.#scroll_horizontal();

    vt.begin_write(
      ...(enabled ? [] : [vt.cursor.save]),
      EDITOR_BG,
      ...vt.clear(area.y0, area.x0, area.h, area.w),
    );

    this.#y = area.y0;
    this.#ln = this.#scroll_ln;

    let span = { len: 0 };

    while (true) {
      span = this.#begin_ln();

      if (this.#ln < buffer.ln_count) {
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
        vt.cursor.set(this.#cursor_y, this.#cursor_x),
      );
    } else {
      vt.end_write(vt.cursor.restore);
    }
  }

  #begin_ln(): vt.fmt.Span {
    const { x0, w } = this.editor.area;
    vt.write(vt.cursor.set(this.#y, x0));
    return { len: w };
  }

  #end_ln(): boolean {
    const { y1 } = this.editor.area;
    this.#y = Math.min(this.#y + 1, y1);
    return this.#y === y1;
  }

  #render_line(span: vt.fmt.Span): void {
    const { shaper, cursor, invisible_enabled } = this.editor;

    this.#render_line_index(span);

    for (const cell of shaper.line(this.#ln, this.#wrap_width)) {
      if (cell.i > 0 && cell.col === 0) {
        if (this.#end_ln()) {
          return;
        }
        span = this.#begin_ln();
        this.#blank_line_index(span);
      }

      if ((cell.col < this.#scroll_col) || (cell.grapheme.width > span.len)) {
        continue;
      }

      let color: Uint8Array;

      if (cursor.is_selected(this.#ln, cell.i)) {
        color = cell.grapheme.is_whitespace ? EDITOR_SELECTED_INVISIBLE_COLORS : EDITOR_SELECTED_CHAR_COLORS;
      } else {
        color = cell.grapheme.is_whitespace
          ? invisible_enabled ? EDITOR_INVISIBLE_ON_COLORS : EDITOR_INVISIBLE_OFF_COLORS
          : EDITOR_CHAR_COLORS;
      }

      vt.write(color, cell.grapheme.bytes);

      span.len -= cell.grapheme.width;
    }
  }

  #render_line_index(span: vt.fmt.Span): void {
    if (this.#index_width > 0) {
      vt.write(
        EDITOR_LINE_INDEX_COLORS,
        ...vt.fmt.text(span, `${this.#ln + 1} `.padStart(this.#index_width)),
      );
    }
  }

  #blank_line_index(span: vt.fmt.Span): void {
    if (this.#index_width > 0) {
      vt.write(
        EDITOR_BLANK_LINE_INDEX_COLORS,
        vt.fmt.space(span, this.#index_width),
      );
    }
  }

  center(): void {
    const { shaper, cursor, area } = this.editor;

    let height = Math.trunc(area.h / 2);

    for (let i = cursor.ln - 1; i >= 0; i -= 1) {
      const h = shaper.count_wraps(i, this.#wrap_width);
      if (h > height) {
        break;
      }

      height -= h;
      this.#scroll_ln = i;
    }
  }

  #scroll_vertical(): void {
    const { shaper, cursor, area } = this.editor;

    const delta_ln = cursor.ln - this.#scroll_ln;

    // Did the cursor move above the scroll line?
    if (delta_ln <= 0) {
      this.#scroll_ln = cursor.ln;
      return;
    }

    // Did the cursor move below the scroll area?

    if (delta_ln > area.h) {
      this.#scroll_ln = cursor.ln - area.h;
    }

    const height_arr = range(this.#scroll_ln, cursor.ln).map((i) => shaper.count_wraps(i, this.#wrap_width));
    let height = sum(height_arr);

    for (const h of height_arr) {
      if (height < area.h) {
        break;
      }

      this.#scroll_ln += 1;
      height -= h;
    }

    this.#cursor_y += height;
  }

  #scroll_horizontal(): void {
    const { shaper, cursor } = this.editor;

    let c = 0; // c = f(cursor.col)

    const line = shaper.line(cursor.ln, this.#wrap_width, true).toArray();
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

    const width_arr = line.slice(cursor.col - delta_col, cursor.col)
      .map((x) => x.grapheme.width);
    let width = sum(width_arr);

    for (const w of width_arr) {
      if (width < this.#text_width) {
        break;
      }

      this.#scroll_col += 1;
      width -= w;
    }

    this.#cursor_x += width;
  }
}
