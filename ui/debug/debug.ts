import { Area, Pane } from "@lib/ui";
import {
  clear,
  fmt_text,
  restore_cursor,
  save_cursor,
  set_cursor,
  sync_write,
} from "@lib/vt";
import { DEBUG_BG, DEBUG_COLORS } from "@ui/theme";

export const DebugArea = new Area(0, 0, 15, 3);

export class Debug extends Pane {
  #editor_render_time = 0;

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, h, w } = this.area;

    sync_write(
      save_cursor,
      DEBUG_BG,
      ...clear(y0, x0, h, w),
      set_cursor(y0 + 1, x0 + 1),
      DEBUG_COLORS,
      ...fmt_text(
        { len: w - 1 },
        "Render: ",
        this.#editor_render_time.toString(),
        " ms",
      ),
      restore_cursor,
    );
  }

  set_editor_render_time(x: number): void {
    if (this.enabled) {
      this.#editor_render_time = x;
      this.render();
    }
  }
}
