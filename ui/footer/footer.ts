import { clamp } from "@lib/std";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";

export class Footer extends Control {
  #cursor_status = "";

  layout({ y, x, w, h }: Area): void {
    this.w = w;
    this.h = clamp(1, 0, h);

    this.y = y + h - 1;
    this.x = x;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...vt.clear_area(this),
    );

    const span: [number] = [this.w];

    const data = [
      colors.TEXT,
      ...vt.write_text_aligned(span, "left", this.#cursor_status),
    ];

    vt.flush_buf(
      vt.cursor.set(this.y, this.x + span[0]),
      ...data,
      vt.cursor.restore,
      vt.cursor.show,
    );

    vt.esu();
  }

  set_cursor_status(data: { ln: number; col: number; ln_count: number }): void {
    if (!this.enabled) {
      return;
    }

    const ln = data.ln + 1;
    const col = data.col + 1;
    const pct = data.ln_count === 0
      ? 0
      : ((ln / data.ln_count) * 100).toFixed(0);

    this.#cursor_status = `${ln} ${col}  ${pct}% `;

    this.render();
  }
}
