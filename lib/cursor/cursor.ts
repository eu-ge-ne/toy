import { SegBuf } from "@lib/seg-buf";
import { clamp } from "@lib/std";

export class Cursor {
  #ln0 = 0;
  #col0 = 0;

  ln = 0;
  col = 0;

  selecting = false;

  readonly from = { ln: 0, col: 0 };
  readonly to = { ln: 0, col: 0 };

  constructor(private buffer: SegBuf) {
  }

  set(ln: number, col: number, sel: boolean): boolean {
    const { ln: old_ln, col: old_col } = this;

    this.#set_ln(ln);
    this.#set_col(col);
    this.#set_selection(old_ln, old_col, sel);
    this.#set_range();

    return this.ln !== old_ln || this.col !== old_col;
  }

  top(sel: boolean): boolean {
    return this.set(0, 0, sel);
  }

  bottom(sel: boolean): boolean {
    return this.set(Number.MAX_SAFE_INTEGER, 0, sel);
  }

  home(sel: boolean): boolean {
    return this.set(this.ln, 0, sel);
  }

  end(sel: boolean): boolean {
    return this.set(this.ln, Number.MAX_SAFE_INTEGER, sel);
  }

  up(n: number, sel: boolean): boolean {
    return this.set(this.ln - n, this.col, sel);
  }

  down(n: number, sel: boolean): boolean {
    return this.set(this.ln + n, this.col, sel);
  }

  left(sel: boolean): boolean {
    if (this.set(this.ln, this.col - 1, sel)) {
      return true;
    }

    if (this.ln > 0) {
      return this.set(this.ln - 1, Number.MAX_SAFE_INTEGER, sel);
    }

    return false;
  }

  right(sel: boolean): boolean {
    if (this.set(this.ln, this.col + 1, sel)) {
      return true;
    }

    if (this.ln < this.buffer.buf.lineCount - 1) {
      return this.set(this.ln + 1, 0, sel);
    }

    return false;
  }

  forward(n: number): boolean {
    return this.set(this.ln, this.col + n, false);
  }

  is_selected(ln: number, col: number): boolean {
    if (!this.selecting) {
      return false;
    }

    if (ln < this.from.ln || ln > this.to.ln) {
      return false;
    }

    if (ln === this.from.ln && col < this.from.col) {
      return false;
    }

    if (ln === this.to.ln && col > this.to.col) {
      return false;
    }

    return true;
  }

  #set_ln(ln: number): void {
    let max = this.buffer.buf.lineCount - 1;
    if (max < 0) {
      max = 0;
    }

    this.ln = clamp(ln, 0, max);
  }

  #set_col(col: number): void {
    let len = 0;

    for (const { gr } of this.buffer.line(this.ln)) {
      if (gr.isEol) {
        break;
      }
      len += 1;
    }

    this.col = clamp(col, 0, len);
  }

  #set_selection(ln: number, col: number, sel: boolean): void {
    if (!sel) {
      this.selecting = false;
      return;
    }

    if (!this.selecting) {
      this.#ln0 = ln;
      this.#col0 = col;
    }

    this.selecting = true;
  }

  #set_range(): void {
    if (
      (this.#ln0 > this.ln) ||
      (this.#ln0 === this.ln && this.#col0 > this.col)
    ) {
      this.from.ln = this.ln;
      this.from.col = this.col;
      this.to.ln = this.#ln0;
      this.to.col = this.#col0;
    } else {
      this.from.ln = this.#ln0;
      this.from.col = this.#col0;
      this.to.ln = this.ln;
      this.to.col = this.col;
    }
  }
}
