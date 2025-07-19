import { clamp } from "./clamp.ts";
import { Editor } from "./editor.ts";

export class Cursor {
  ln = 0;
  col = 0;
  selecting = false;
  from: [number, number] = [0, 0];
  to: [number, number] = [0, 0];

  #start_ln = 0;
  #start_col = 0;

  constructor(private editor: Editor) {
  }

  set(ln: number, col: number, sel: boolean): boolean {
    return this.#set(ln, col, sel);
  }

  move(dy: number, dx: number, sel: boolean): boolean {
    return this.#set(this.ln + dy, this.col + dx, sel);
  }

  is_selected(ln: number, col: number): boolean {
    if (!this.selecting) {
      return false;
    }

    const [from_ln, from_col] = this.from;
    const [to_ln, to_col] = this.to;

    if (ln < from_ln || ln > to_ln) {
      return false;
    }

    if (ln === from_ln && col < from_col) {
      return false;
    }

    if (ln === to_ln && col > to_col) {
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
    let max = this.editor.buf.ln_count - 1;
    if (max < 0) {
      max = 0;
    }

    this.ln = clamp(ln, 0, max);
  }

  #set_col(col: number): void {
    const { shaper } = this.editor;

    let max = -1;
    for (const { g, i } of shaper.line(this.ln)) {
      if (!g.is_eol) {
        max = i;
      }
    }

    this.col = clamp(col, 0, max + 1);
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

    if (
      (this.#start_ln > new_ln) ||
      (this.#start_ln === new_ln && this.#start_col > new_col)
    ) {
      this.from[0] = new_ln;
      this.from[1] = new_col;

      this.to[0] = this.#start_ln;
      this.to[1] = this.#start_col;
    } else {
      this.from[0] = this.#start_ln;
      this.from[1] = this.#start_col;

      this.to[0] = new_ln;
      this.to[1] = new_col;
    }
  }
}
