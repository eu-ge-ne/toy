import { Buffer } from "@libs/buffer";
import * as events from "@libs/events";
import * as std from "@libs/std";

export class Pos {
  constructor(readonly ln: number, readonly col: number) {
  }

  clone(): Pos {
    return new Pos(this.ln, this.col);
  }
}

export class Cursor {
  readonly #emitter = new events.SignalEmitter<{
    "cursor.change": () => void;
  }>();

  #selStart = new Pos(0, 0);

  constructor(private readonly buffer: Buffer) {
  }

  readonly signals = this.#emitter.listener;

  pos = new Pos(0, 0);
  isSelecting = false;
  from = new Pos(0, 0);
  to = new Pos(0, 0);

  set(ln: number, col: number, select: boolean): boolean {
    const old = this.pos;

    ln = std.clamp(ln, 0, Math.max(this.buffer.lineCount - 1, 0));
    col = std.clamp(col, 0, this.buffer.lineCursorMaxCol(ln));

    this.pos = new Pos(ln, col);

    if (!select) {
      this.#selStart = this.pos;
    } else if (!this.isSelecting) {
      this.#selStart = old;
    }
    this.isSelecting = select;

    if (
      (this.#selStart.ln > this.pos.ln) ||
      (this.#selStart.ln === this.pos.ln && this.#selStart.col > this.pos.col)
    ) {
      this.from = this.pos;
      this.to = this.#selStart;
    } else {
      this.from = this.#selStart;
      this.to = this.pos;
    }

    const changed = this.pos.ln !== old.ln || this.pos.col !== old.col;
    if (changed) {
      this.#emitter.broadcast("cursor.change");
    }

    return changed;
  }

  top(select: boolean): boolean {
    return this.set(0, 0, select);
  }

  bottom(select: boolean): boolean {
    return this.set(Number.MAX_SAFE_INTEGER, 0, select);
  }

  home(select: boolean): boolean {
    return this.set(this.pos.ln, 0, select);
  }

  end(select: boolean): boolean {
    return this.set(this.pos.ln, Number.MAX_SAFE_INTEGER, select);
  }

  up(n: number, select: boolean): boolean {
    return this.set(this.pos.ln - n, this.pos.col, select);
  }

  down(n: number, select: boolean): boolean {
    return this.set(this.pos.ln + n, this.pos.col, select);
  }

  left(select: boolean): boolean {
    if (this.set(this.pos.ln, this.pos.col - 1, select)) {
      return true;
    }

    if (this.pos.ln > 0) {
      return this.set(this.pos.ln - 1, Number.MAX_SAFE_INTEGER, select);
    }

    return false;
  }

  right(select: boolean): boolean {
    if (this.set(this.pos.ln, this.pos.col + 1, select)) {
      return true;
    }

    if (this.pos.ln < this.buffer.lineCount - 1) {
      return this.set(this.pos.ln + 1, 0, select);
    }

    return false;
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
}
