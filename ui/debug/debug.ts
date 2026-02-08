import { Command } from "@lib/commands";
import { Globals } from "@lib/globals";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const MIB = Math.pow(1024, 2);

export class Debug extends Component<Globals> {
  #colors = colors(DefaultTheme);
  #enabled = false;

  async run(): Promise<void> {
    throw new Error("Not implemented");
  }

  resize(p: Area): void {
    this.area.w = clamp(30, 0, p.w);
    this.area.h = clamp(7, 0, p.h);
    this.area.y = p.y + p.h - this.area.h;
    this.area.x = p.x + p.w - this.area.w;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    const mem = Deno.memoryUsage();
    const rss = (mem.rss / MIB).toFixed();
    const heap_total = (mem.heapTotal / MIB).toFixed();
    const heap_used = (mem.heapUsed / MIB).toFixed();
    const external_mem = (mem.external / MIB).toFixed();

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this.area);
    vt.buf.write(this.#colors.text);
    vt.cursor.set(vt.buf, this.area.y + 1, this.area.x + 1);
    vt.write_text(
      vt.buf,
      [this.area.w - 1],
      `Input    : ${this.globals.inputTime.toFixed(1)} ms`,
    );
    vt.cursor.set(vt.buf, this.area.y + 2, this.area.x + 1);
    vt.write_text(
      vt.buf,
      [this.area.w - 1],
      `Render   : ${this.globals.renderTime.toFixed(1)} ms`,
    );
    vt.cursor.set(vt.buf, this.area.y + 3, this.area.x + 1);
    vt.write_text(vt.buf, [this.area.w - 1], `RSS      : ${rss} MiB`);
    vt.cursor.set(vt.buf, this.area.y + 4, this.area.x + 1);
    vt.write_text(
      vt.buf,
      [this.area.w - 1],
      `Heap     : ${heap_used}/${heap_total} MiB`,
    );
    vt.cursor.set(vt.buf, this.area.y + 5, this.area.x + 1);
    vt.write_text(vt.buf, [this.area.w - 1], `External : ${external_mem} MiB`);
    vt.buf.write(vt.cursor.restore);
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
  }

  async handleCommand(cmd: Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        break;

      case "Debug":
        this.#enabled = !this.#enabled;
        break;
    }
  }
}
