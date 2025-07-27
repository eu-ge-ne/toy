import { FOOTER_BG, FOOTER_CURSOR_COLORS } from "@lib/theme";
import { Control } from "@lib/ui";
import * as vt from "@lib/vt";

export class Footer extends Control {
  #cursor_status = "";

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, h, w } = this.area;
    const space = { len: w };

    vt.begin_sync();

    vt.write(
      vt.cursor.save,
      FOOTER_BG,
      ...vt.clear(y0, x0, h, w),
    );

    const data = [
      FOOTER_CURSOR_COLORS,
      ...vt.fmt.text(space, this.#cursor_status),
      vt.fmt.space(space, 1),
    ];

    vt.write(
      vt.cursor.set(y0, x0 + space.len),
      ...data,
      vt.cursor.restore,
    );

    vt.end_sync();
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

    this.#cursor_status = `${ln} ${col}  ${pct}%`;

    this.render();
  }
}
