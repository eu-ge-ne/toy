import { Area, Pane } from "@lib/ui";
import * as vt from "@lib/vt";
import { DEBUG_BG, DEBUG_COLORS } from "@ui/theme";

export const DebugArea = new Area(0, 0, 15, 3);

export class Debug extends Pane {
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
      vt.cursor.set(y0 + 1, x0 + 1),
      DEBUG_COLORS,
      ...vt.fmt.text(
        { len: w - 1 },
        "Render: ",
        this.#editor_render_time.toString(),
        " ms",
      ),
      vt.cursor.restore,
    );
  }

  set_editor_render_time(x: number): void {
    if (this.enabled) {
      this.#editor_render_time = x;
      this.render();
    }
  }
}
