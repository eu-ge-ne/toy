import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";
import { DEBUG_BG, DEBUG_COLORS } from "@ui/theme";

const AREA = new Area(0, 0, 15, 4);

export class Debug extends Control {
  #command_time = 0;
  #render_time = 0;

  override resize(area: Area): void {
    super.resize(
      new Area(
        area.x0 + area.w - AREA.w,
        area.y0 + area.h - AREA.h,
        AREA.w,
        AREA.h,
      ),
    );
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, h, w } = this.area;

    vt.write(
      vt.bsu,
      vt.cursor.save,
      DEBUG_BG,
      ...vt.clear(y0, x0, h, w),
      DEBUG_COLORS,
      vt.cursor.set(y0 + 1, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "Command: ",
        this.#command_time.toString(),
        " ms",
      ),
      vt.cursor.set(y0 + 2, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "Render: ",
        this.#render_time.toString(),
        " ms",
      ),
      vt.cursor.restore,
      vt.esu,
    );
  }

  set_command_time(x: number): void {
    if (this.enabled) {
      this.#command_time = x;

      this.render();
    }
  }

  set_render_time(x: number): void {
    if (this.enabled) {
      this.#render_time = x;

      this.render();
    }
  }
}
