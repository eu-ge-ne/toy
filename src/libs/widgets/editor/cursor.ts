import * as buffers from "@libs/buffers";
import * as std from "@libs/std";

export type Pos = {
  ln: number;
  col: number;
};

export class Cursor {
  #selFrom: Readonly<Pos> = { ln: 0, col: 0 };

  pos: Readonly<Pos> = { ln: 0, col: 0 };

  isSelecting = false;
  from: Readonly<Pos> = { ln: 0, col: 0 };
  to: Readonly<Pos> = { ln: 0, col: 0 };

  onChange?: () => void;

  constructor(private readonly buffer: buffers.Buffer) {
  }

  set(to: Pos, select: boolean): boolean {
    const old = this.pos;

    const ln = std.clamp(to.ln, 0, Math.max(this.buffer.lineCount - 1, 0));
    let maxCol = 0;
    for (const { gr } of this.buffer.line(ln)) {
      if (gr.isEol) {
        break;
      }
      maxCol += 1;
    }
    const col = std.clamp(to.col, 0, maxCol);
    this.pos = { ln, col };

    if (select && !this.isSelecting) {
      this.#selFrom = old;
    }
    this.isSelecting = select;

    if (
      (this.#selFrom.ln > this.pos.ln) ||
      (this.#selFrom.ln === this.pos.ln && this.#selFrom.col > this.pos.col)
    ) {
      this.from = this.pos;
      this.to = this.#selFrom;
    } else {
      this.from = this.#selFrom;
      this.to = this.pos;
    }

    const changed = this.pos.ln !== old.ln || this.pos.col !== old.col;
    if (changed) {
      this.onChange?.();
    }

    return changed;
  }

  top(select: boolean): boolean {
    return this.set({ ln: 0, col: 0 }, select);
  }

  bottom(select: boolean): boolean {
    return this.set({ ln: Number.MAX_SAFE_INTEGER, col: 0 }, select);
  }

  home(select: boolean): boolean {
    return this.set({ ln: this.pos.ln, col: 0 }, select);
  }

  end(select: boolean): boolean {
    return this.set({ ln: this.pos.ln, col: Number.MAX_SAFE_INTEGER }, select);
  }

  up(n: number, select: boolean): boolean {
    return this.set({ ln: this.pos.ln - n, col: this.pos.col }, select);
  }

  down(n: number, select: boolean): boolean {
    return this.set({ ln: this.pos.ln + n, col: this.pos.col }, select);
  }

  left(select: boolean): boolean {
    if (this.set({ ln: this.pos.ln, col: this.pos.col - 1 }, select)) {
      return true;
    }

    if (this.pos.ln > 0) {
      return this.set({ ln: this.pos.ln - 1, col: Number.MAX_SAFE_INTEGER }, select);
    }

    return false;
  }

  right(select: boolean): boolean {
    if (this.set({ ln: this.pos.ln, col: this.pos.col + 1 }, select)) {
      return true;
    }

    if (this.pos.ln < this.buffer.lineCount - 1) {
      return this.set({ ln: this.pos.ln + 1, col: 0 }, select);
    }

    return false;
  }

  forward(n: number): boolean {
    return this.set({ ln: this.pos.ln, col: this.pos.col + n }, false);
  }

  selectAll(): void {
    this.set({ ln: 0, col: 0 }, false);
    this.set({ ln: Number.MAX_SAFE_INTEGER, col: Number.MAX_SAFE_INTEGER }, true);
  }

  isSelected(x: Pos): boolean {
    if (!this.isSelecting) {
      return false;
    }

    if (x.ln < this.from.ln || x.ln > this.to.ln) {
      return false;
    }

    if (x.ln === this.from.ln && x.col < this.from.col) {
      return false;
    }

    if (x.ln === this.to.ln && x.col > this.to.col) {
      return false;
    }

    return true;
  }
}
