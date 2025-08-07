import { clamp } from "@lib/std";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";

const MIB = Math.pow(1024, 2);

export class Debug extends Control {
  #input_time = "0";
  #render_time = "0";

  layout({ y, x, w, h }: Area): void {
    this.w = clamp(30, 0, w);
    this.h = clamp(7, 0, h);

    this.y = y + h - this.h;
    this.x = x + w - this.w;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const mem = Deno.memoryUsage();
    const rss = (mem.rss / MIB).toFixed();
    const heap_total = (mem.heapTotal / MIB).toFixed();
    const heap_used = (mem.heapUsed / MIB).toFixed();
    const external_mem = (mem.external / MIB).toFixed();

    vt.bsu();

    vt.flush_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...vt.clear_area(this),
      colors.TEXT,
      vt.cursor.set(this.y + 1, this.x + 1),
      ...vt.fmt.fit(
        { len: this.w - 1 },
        "Input    : ",
        this.#input_time,
        " ms",
      ),
      vt.cursor.set(this.y + 2, this.x + 1),
      ...vt.fmt.fit(
        { len: this.w - 1 },
        "Render   : ",
        this.#render_time,
        " ms",
      ),
      vt.cursor.set(this.y + 3, this.x + 1),
      ...vt.fmt.fit(
        { len: this.w - 1 },
        "RSS      : ",
        rss,
        " MiB",
      ),
      vt.cursor.set(this.y + 4, this.x + 1),
      ...vt.fmt.fit(
        { len: this.w - 1 },
        "Heap     : ",
        heap_used,
        "/",
        heap_total,
        " MiB",
      ),
      vt.cursor.set(this.y + 5, this.x + 1),
      ...vt.fmt.fit(
        { len: this.w - 1 },
        "External : ",
        external_mem,
        " MiB",
      ),
      vt.cursor.restore,
      vt.cursor.show,
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
