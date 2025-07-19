import * as vt from "@lib/vt";
import { VT_WIDTH_COLORS } from "@ui/theme";

import { Editor } from "./editor.ts";
import { range } from "./range.ts";
import { sum } from "./sum.ts";

export class Scroll {
  #editor: Editor;

  ln = 0;
  col = 0;
  cursor_y = 0;
  cursor_x = 0;

  constructor(editor: Editor) {
    this.#editor = editor;
  }

  scroll(): void {
    const { area, ln_index_width } = this.#editor;

    this.cursor_y = area.y0;
    this.cursor_x = area.x0 + ln_index_width;

    this.#vertical();
    this.#horizontal();
  }

  center(): void {
    const { area, cursor, wrap_width } = this.#editor;

    let height = Math.trunc(area.h / 2);

    for (let i = cursor.ln - 1; i >= 0; i -= 1) {
      const h = this.#editor.line(i, wrap_width)
        .reduce((a, x) => a + (x.c === 0 ? 1 : 0), 0);
      if (h > height) {
        break;
      }

      height -= h;
      this.ln = i;
    }
  }

  #vertical(): void {
    const { area, cursor, wrap_width } = this.#editor;

    // Did the cursor move above the scroll line?
    if (cursor.ln <= this.ln) {
      this.ln = cursor.ln;
      return;
    }

    // Did the cursor move below the scroll area?

    if (cursor.ln - this.ln > area.h) {
      this.ln = cursor.ln - area.h;
    }

    const min_height = area.h;
    const height_arr = range(this.ln, cursor.ln).map((i) =>
      this.#editor.line(i, wrap_width)
        .reduce((a, x) => a + (x.c === 0 ? 1 : 0), 0)
    );
    let height = sum(height_arr);

    for (const h of height_arr) {
      if (height < min_height) {
        break;
      }

      this.ln += 1;
      height -= h;
    }

    this.cursor_y += height;
  }

  #horizontal(): void {
    const { area, cursor, wrap_width, ln_index_width } = this.#editor;

    const fold = this.#fold_line(cursor.ln, wrap_width).toArray();

    let l = 0;
    let c = 0; // c = f(cursor.col)
    const { value: p } = this.#editor.line(cursor.ln, wrap_width).drop(
      cursor.col,
    )
      .next();
    if (p) {
      l = p.l;
      c = p.c;
      this.cursor_y += p.l;
    }

    // Did the cursor move to the left of the scroll column?
    if (c <= this.col) {
      this.col = c;
      return;
    }

    // Did the cursor move to the right of the scroll area?

    const min_width = area.w - ln_index_width;
    const width_arr = fold[l]!.slice(this.col, c);
    let width = sum(width_arr);

    for (const w of width_arr) {
      if (width < min_width) {
        break;
      }

      this.col += 1;
      width -= w;
    }

    this.cursor_x += width;
  }

  // TODO: review, refactor/inline into #horizontal
  *#fold_line(ln: number, max_width: number): Generator<number[]> {
    let ww: number[] = [];

    let width = max_width;

    for (const g of this.#editor.buf.line_graphemes(ln)) {
      if (typeof g.vt_width === "undefined") {
        g.vt_width = vt.width(VT_WIDTH_COLORS, g.bytes);
      }

      if (width < g.vt_width) {
        yield ww;
        ww = [];
        width = max_width;
      }

      ww.push(g.vt_width);
      width -= g.vt_width;
    }

    if (width === 0) {
      yield ww;
      ww = [];
    }

    yield ww;
  }
}
