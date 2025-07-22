import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";
import { DEBUG_BG, DEBUG_COLORS } from "@ui/theme";

export const DebugArea = new Area(0, 0, 15, 4);

export class Debug extends Control {
  #react_time = 0;
  #editor_render_time = 0;

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, h, w } = this.area;

    vt.sync_write(
      vt.cursor.save,
      DEBUG_BG,
      ...vt.clear(y0, x0, h, w),
      DEBUG_COLORS,
      vt.cursor.set(y0 + 1, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "React : ",
        this.#react_time.toString(),
        " ms",
      ),
      vt.cursor.set(y0 + 2, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "Render: ",
        this.#editor_render_time.toString(),
        " ms",
      ),
      vt.cursor.restore,
    );
  }

  set_react_time(x: number): void {
    if (this.enabled) {
      this.#react_time = x;
      this.render();
    }
  }

  set_editor_render_time(x: number): void {
    if (this.enabled) {
      this.#editor_render_time = x;
      this.render();
    }
  }
}
