import * as buffers from "@libs/buffers";
import * as std from "@libs/std";

export class Cursor {
  #selStartLn0 = 0;
  #selStartCol0 = 0;

  ln = 0;
  col = 0;

  isSelecting = false;

  readonly from = { ln: 0, col: 0 };
  readonly to = { ln: 0, col: 0 };

  onChange?: () => void;

  constructor(private readonly buffer: buffers.Buffer) {
  }

  set(ln: number, col: number, select: boolean): boolean {
    const { ln: oldLn, col: oldCol } = this;

    this.ln = std.clamp(ln, 0, Math.max(this.buffer.lineCount - 1, 0));

    let maxCol = 0;
    for (const { gr } of this.buffer.line(this.ln)) {
      if (gr.isEol) {
        break;
      }
      maxCol += 1;
    }
    this.col = std.clamp(col, 0, maxCol);

    this.#setSelection(oldLn, oldCol, select);
    this.#setRange();

    const changed = this.ln !== oldLn || this.col !== oldCol;
    if (changed) {
      this.onChange?.();
    }

    return changed;
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

    if (this.ln < this.buffer.lineCount - 1) {
      return this.set(this.ln + 1, 0, sel);
    }

    return false;
  }

  forward(n: number): boolean {
    return this.set(this.ln, this.col + n, false);
  }

  selectAll(): void {
    this.set(0, 0, false);
    this.set(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);
  }

  isSelected(ln: number, col: number): boolean {
    if (!this.isSelecting) {
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

  #setSelection(ln: number, col: number, select: boolean): void {
    if (select && !this.isSelecting) {
      this.#selStartLn0 = ln;
      this.#selStartCol0 = col;
    }

    this.isSelecting = select;
  }

  #setRange(): void {
    if (
      (this.#selStartLn0 > this.ln) ||
      (this.#selStartLn0 === this.ln && this.#selStartCol0 > this.col)
    ) {
      this.from.ln = this.ln;
      this.from.col = this.col;
      this.to.ln = this.#selStartLn0;
      this.to.col = this.#selStartCol0;
    } else {
      this.from.ln = this.#selStartLn0;
      this.from.col = this.#selStartCol0;
      this.to.ln = this.ln;
      this.to.col = this.col;
    }
  }
}
