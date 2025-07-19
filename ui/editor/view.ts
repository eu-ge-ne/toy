import { Area } from "@lib/ui";
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
import { range } from "./range.ts";
import { sum } from "./sum.ts";

export class View {
  #scroll_area!: Area;
  scroll_wrap_width!: number;

  scroll_ln = 0;
  scroll_col = 0;
  scroll_cursor_y = 0;
  scroll_cursor_x = 0;

  #y = 0;
  #ln = 0;

  constructor(private editor: Editor) {
  }

  resize(area: Area, wrap_enabled: boolean): void {
    this.#scroll_area = area;

    this.scroll_wrap_width = wrap_enabled ? area.w : Number.MAX_SAFE_INTEGER;
  }

  render(): void {
    this.scroll();

    const { buffer, enabled } = this.editor;
    const { y0, x0, h, w } = this.editor.area;

    vt.begin_write(
      ...(enabled ? [] : [vt.cursor.save]),
      EDITOR_BG,
      ...vt.clear(y0, x0, h, w),
    );

    this.#y = y0;
    this.#ln = this.scroll_ln;

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
        vt.cursor.set(this.scroll_cursor_y, this.scroll_cursor_x),
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

    for (
      const { g, i, c } of shaper.wrap_line(this.#ln, this.scroll_wrap_width)
    ) {
      if (i > 0 && c === 0) {
        if (this.#end_ln()) {
          return;
        }
        span = this.#begin_ln();
        this.#blank_line_index(span);
      }

      if (c < this.scroll_col) {
        continue;
      }

      if (g.width > span.len) {
        break;
      }

      let color: Uint8Array;

      if (cursor.is_selected(this.#ln, i)) {
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

      span.len -= g.width;
    }
  }

  #render_line_index(span: vt.fmt.Span): void {
    const { ln_index_width } = this.editor;

    if (ln_index_width > 0) {
      vt.write(
        EDITOR_LINE_INDEX_COLORS,
        ...vt.fmt.lpad(span, ln_index_width, `${this.#ln + 1} `),
      );
    }
  }

  #blank_line_index(span: vt.fmt.Span): void {
    const { ln_index_width } = this.editor;

    vt.write(
      EDITOR_BLANK_LINE_INDEX_COLORS,
      vt.fmt.space(span, ln_index_width),
    );
  }

  scroll(): void {
    this.scroll_cursor_y = this.#scroll_area.y0;
    this.scroll_cursor_x = this.#scroll_area.x0;

    this.#scroll_vertical();
    this.#scroll_horizontal();
  }

  center(): void {
    const { shaper, cursor } = this.editor;

    let height = Math.trunc(this.#scroll_area.h / 2);

    for (let i = cursor.ln - 1; i >= 0; i -= 1) {
      const h = shaper.count_wraps(i, this.scroll_wrap_width);
      if (h > height) {
        break;
      }

      height -= h;
      this.scroll_ln = i;
    }
  }

  #scroll_vertical(): void {
    const { shaper, cursor } = this.editor;

    const delta_ln = cursor.ln - this.scroll_ln;

    // Did the cursor move above the scroll line?
    if (delta_ln <= 0) {
      this.scroll_ln = cursor.ln;
      return;
    }

    // Did the cursor move below the scroll area?

    if (delta_ln > this.#scroll_area.h) {
      this.scroll_ln = cursor.ln - this.#scroll_area.h;
    }

    const height_arr = range(this.scroll_ln, cursor.ln).map((i) =>
      shaper.count_wraps(i, this.scroll_wrap_width)
    );
    let height = sum(height_arr);

    for (const h of height_arr) {
      if (height < this.#scroll_area.h) {
        break;
      }

      this.scroll_ln += 1;
      height -= h;
    }

    this.scroll_cursor_y += height;
  }

  #scroll_horizontal(): void {
    const { shaper, cursor } = this.editor;

    let c = 0; // c = f(cursor.col)

    const line = shaper.wrap_line(cursor.ln, this.scroll_wrap_width)
      .toArray();
    if (line.length > 0) {
      let cell = line[cursor.col];
      if (cell) {
        c = cell.c;
        this.scroll_cursor_y += cell.l;
      } else {
        cell = line[cursor.col - 1];
        if (cell) {
          c = cell.c + 1;
          this.scroll_cursor_y += cell.l;
        }
      }
    }

    const delta_col = c - this.scroll_col;

    // Did the cursor move to the left of the scroll column?
    if (delta_col <= 0) {
      this.scroll_col = c;
      return;
    }

    // Did the cursor move to the right of the scroll area?

    const width_arr = line.slice(cursor.col - delta_col, cursor.col)
      .map((x) => x.g.width);
    let width = sum(width_arr);

    for (const w of width_arr) {
      if (width < this.#scroll_area.w) {
        break;
      }

      this.scroll_col += 1;
      width -= w;
    }

    this.scroll_cursor_x += width;
  }
}
