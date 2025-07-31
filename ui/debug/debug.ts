import { debug as theme } from "@lib/theme";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

const WIDTH = 30;
const HEIGHT = 7;
const MIB = Math.pow(1024, 2);

export class Debug extends Control {
  #input_time = "0";
  #render_time = "0";

  override resize(area: Area): void {
    super.resize(
      new Area(
        area.x0 + area.w - WIDTH,
        area.y0 + area.h - HEIGHT,
        WIDTH,
        HEIGHT,
      ),
    );
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, h, w } = this.area;

    const mem = Deno.memoryUsage();
    const rss = (mem.rss / MIB).toFixed();
    const heap_total = (mem.heapTotal / MIB).toFixed();
    const heap_used = (mem.heapUsed / MIB).toFixed();
    const external_mem = (mem.external / MIB).toFixed();

    vt.bsu();

    vt.flush_buf(
      vt.cursor.save,
      theme.BACKGROUND,
      ...vt.clear(y0, x0, h, w),
      theme.TEXT,
      vt.cursor.set(y0 + 1, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "Input    : ",
        this.#input_time,
        " ms",
      ),
      vt.cursor.set(y0 + 2, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "Render   : ",
        this.#render_time,
        " ms",
      ),
      vt.cursor.set(y0 + 3, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "RSS      : ",
        rss,
      ),
      vt.cursor.set(y0 + 4, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "Heap     : ",
        heap_used,
        "/",
        heap_total,
        " MiB",
      ),
      vt.cursor.set(y0 + 5, x0 + 1),
      ...vt.fmt.text(
        { len: w - 1 },
        "External : ",
        external_mem,
        " MiB",
      ),
      vt.cursor.restore,
    );

    vt.esu();
  }

  set_input_time(x: number): void {
    if (this.enabled) {
      this.#input_time = x.toFixed(1);

      this.render();
    }
  }

  set_render_time(x: number): void {
    if (this.enabled) {
      this.#render_time = x.toFixed(1);

      this.render();
    }
  }
}
