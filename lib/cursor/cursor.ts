import { graphemes } from "@lib/grapheme";
import { Buffer } from "@lib/buffer";
import { clamp } from "@lib/std";

export class Cursor {
  ln = 0;
  col = 0;
  selecting = false;
  readonly from = { ln: 0, col: 0 };
  readonly to = { ln: 0, col: 0 };

  #start_ln = 0;
  #start_col = 0;

  constructor(private buffer: Buffer) {
  }

  set(ln: number, col: number, sel: boolean): boolean {
    return this.#set(ln, col, sel);
  }

  top(sel: boolean): boolean {
    return this.#set(0, 0, sel);
  }

  bottom(sel: boolean): boolean {
    return this.#set(Number.MAX_SAFE_INTEGER, 0, sel);
  }

  home(sel: boolean): boolean {
    return this.#set(this.ln, 0, sel);
  }

  end(sel: boolean): boolean {
    return this.#set(this.ln, Number.MAX_SAFE_INTEGER, sel);
  }

  up(n: number, sel: boolean): boolean {
    return this.#set(this.ln - n, this.col, sel);
  }

  down(n: number, sel: boolean): boolean {
    return this.#set(this.ln + n, this.col, sel);
  }

  left(sel: boolean): boolean {
    if (this.#set(this.ln, this.col - 1, sel)) {
      return true;
    }

    if (this.ln > 0) {
      return this.#set(this.ln - 1, Number.MAX_SAFE_INTEGER, sel);
    }

    return false;
  }

  right(sel: boolean): boolean {
    if (this.#set(this.ln, this.col + 1, sel)) {
      return true;
    }

    if (this.ln < this.buffer.line_count - 1) {
      return this.#set(this.ln + 1, 0, sel);
    }

    return false;
  }

  forward(n: number): boolean {
    return this.#set(this.ln, this.col + n, false);
  }

  is_selected(ln: number, col: number): boolean {
    if (!this.selecting) {
      return false;
    }

    const { from, to } = this;

    if (ln < from.ln || ln > to.ln) {
      return false;
    }

    if (ln === from.ln && col < from.col) {
      return false;
    }

    if (ln === to.ln && col > to.col) {
      return false;
    }

    return true;
  }

  #set(ln: number, col: number, sel: boolean): boolean {
    const {
      ln: old_ln,
      col: old_col,
    } = this;

    this.#set_ln(ln);
    this.#set_col(col);

    this.#set_range(old_ln, old_col, this.ln, this.col, sel);

    return this.ln !== old_ln ||
      this.col !== old_col;
  }

  #set_ln(ln: number): void {
    let max = this.buffer.line_count - 1;
    if (max < 0) {
      max = 0;
    }

    this.ln = clamp(ln, 0, max);
  }

  #set_col(col: number): void {
    let len = 0;

    for (const seg of this.buffer.seg_line(this.ln)) {
      const grm = graphemes.get(seg);
      if (grm.is_eol) {
        break;
      }
      len += 1;
    }

    this.col = clamp(col, 0, len);
  }

  #set_range(
    old_ln: number,
    old_col: number,
    new_ln: number,
    new_col: number,
    sel: boolean,
  ): void {
    if (!sel) {
      this.selecting = false;
      return;
    }

    if (!this.selecting) {
      this.#start_ln = old_ln;
      this.#start_col = old_col;
    }

    this.selecting = true;

    const { from, to } = this;

    if (
      (this.#start_ln > new_ln) ||
      (this.#start_ln === new_ln && this.#start_col > new_col)
    ) {
      from.ln = new_ln;
      from.col = new_col;

      to.ln = this.#start_ln;
      to.col = this.#start_col;
    } else {
      from.ln = this.#start_ln;
      from.col = this.#start_col;

      to.ln = new_ln;
      to.col = new_col;
    }
  }
}
