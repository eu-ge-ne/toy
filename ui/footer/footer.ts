import { Pane } from "@lib/ui";
import {
  begin_write,
  clear,
  end_write,
  fmt_space,
  fmt_text,
  restore_cursor,
  save_cursor,
  set_cursor,
} from "@lib/vt";
import {
  FOOTER_BG,
  FOOTER_CURSOR_COLORS,
  FOOTER_INVISIBLE_OFF_COLORS,
  FOOTER_INVISIBLE_ON_COLORS,
  FOOTER_MESSAGE_COLORS,
  FOOTER_WRAP_OFF_COLORS,
  FOOTER_WRAP_ON_COLORS,
} from "@ui/theme";

const INVISIBLE_FLAG = "␠";
const WRAP_FLAG = "↩";

export class Footer extends Pane {
  #input_message = "";
  #invisible_status = false;
  #wrap_status = false;
  #cursor_status = "";

  render(): void {
    const { y0, x0, h, w } = this.area;
    const space = { len: w };

    begin_write(
      save_cursor,
      FOOTER_BG,
      ...clear(y0, x0, h, w),
      set_cursor(y0, x0),
      FOOTER_MESSAGE_COLORS,
      ...fmt_text(space, this.#input_message),
    );

    const data = [
      fmt_space(space, 1),
      this.#invisible_status
        ? FOOTER_INVISIBLE_ON_COLORS
        : FOOTER_INVISIBLE_OFF_COLORS,
      ...fmt_text(space, INVISIBLE_FLAG),
      fmt_space(space, 1),
      this.#wrap_status ? FOOTER_WRAP_ON_COLORS : FOOTER_WRAP_OFF_COLORS,
      ...fmt_text(space, WRAP_FLAG),
      fmt_space(space, 2),
      FOOTER_CURSOR_COLORS,
      ...fmt_text(space, this.#cursor_status),
      fmt_space(space, 1),
    ];

    end_write(
      set_cursor(y0, x0 + space.len),
      ...data,
      restore_cursor,
    );
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

  set_invisible_status(x: boolean): void {
    this.#invisible_status = x;
    this.render();
  }

  set_wrap_status(x: boolean): void {
    this.#wrap_status = x;
    this.render();
  }
}
