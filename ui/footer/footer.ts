import { footer as theme } from "@lib/theme";
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

    vt.bsu();

    vt.write_buf(
      vt.cursor.save,
      theme.BACKGROUND,
      ...vt.clear(y0, x0, h, w),
    );

    const data = [
      theme.TEXT,
      ...vt.fmt.text(space, this.#cursor_status),
      vt.fmt.space(space, 1),
    ];

    vt.flush_buf(
      vt.cursor.set(y0, x0 + space.len),
      ...data,
      vt.cursor.restore,
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

    this.#cursor_status = `${ln} ${col}  ${pct}%`;

    this.render();
  }
}
