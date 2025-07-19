import { Cursor } from "@lib/cursor";
import { Shaper } from "@lib/shaper";
import { Area } from "@lib/ui";

import { range } from "./range.ts";
import { sum } from "./sum.ts";

export class Scroll {
  #area!: Area;
  wrap_width!: number;

  ln = 0;
  col = 0;
  cursor_y = 0;
  cursor_x = 0;

  constructor(private shaper: Shaper, private cursor: Cursor) {
  }

  resize(area: Area, wrap_enabled: boolean): void {
    this.#area = area;

    this.wrap_width = wrap_enabled ? area.w : Number.MAX_SAFE_INTEGER;
  }

  scroll(): void {
    this.cursor_y = this.#area.y0;
    this.cursor_x = this.#area.x0;

    this.#vertical();
    this.#horizontal();
  }

  center(): void {
    let height = Math.trunc(this.#area.h / 2);

    for (let i = this.cursor.ln - 1; i >= 0; i -= 1) {
      const h = this.shaper.count_wraps(i, this.wrap_width);
      if (h > height) {
        break;
      }

      height -= h;
      this.ln = i;
    }
  }

  #vertical(): void {
    const delta_ln = this.cursor.ln - this.ln;

    // Did the cursor move above the scroll line?
    if (delta_ln <= 0) {
      this.ln = this.cursor.ln;
      return;
    }

    // Did the cursor move below the scroll area?

    if (delta_ln > this.#area.h) {
      this.ln = this.cursor.ln - this.#area.h;
    }

    const height_arr = range(this.ln, this.cursor.ln).map((i) =>
      this.shaper.count_wraps(i, this.wrap_width)
    );
    let height = sum(height_arr);

    for (const h of height_arr) {
      if (height < this.#area.h) {
        break;
      }

      this.ln += 1;
      height -= h;
    }

    this.cursor_y += height;
  }

  #horizontal(): void {
    let c = 0; // c = f(cursor.col)

    const line = this.shaper.wrap_line(this.cursor.ln, this.wrap_width)
      .toArray();
    if (line.length > 0) {
      let cell = line[this.cursor.col];
      if (cell) {
        c = cell.c;
        this.cursor_y += cell.l;
      } else {
        cell = line[this.cursor.col - 1];
        if (cell) {
          c = cell.c + 1;
          this.cursor_y += cell.l;
        }
      }
    }

    const delta_col = c - this.col;

    // Did the cursor move to the left of the scroll column?
    if (delta_col <= 0) {
      this.col = c;
      return;
    }

    // Did the cursor move to the right of the scroll area?

    const width_arr = line.slice(this.cursor.col - delta_col, this.cursor.col)
      .map((x) => x.g.width);
    let width = sum(width_arr);

    for (const w of width_arr) {
      if (width < this.#area.w) {
        break;
      }

      this.col += 1;
      width -= w;
    }

    this.cursor_x += width;
  }
}
