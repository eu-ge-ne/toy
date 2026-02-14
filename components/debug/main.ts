import { Area } from "@components/area";
import { IRoot } from "@components/root";
import { Command } from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

const MIB = Math.pow(1024, 2);

export class Debug extends Component {
  #colors = colors(DefaultTheme);
  #area = new Area(this.#colors.background);
  #enabled = false;

  constructor(private readonly root: IRoot) {
    super();
  }

  layout(): void {
    this.#area.resize(this.w, this.h, this.y, this.x);
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

    vt.buf.write(vt.cursor.save);
    this.#area.render();
    vt.buf.write(this.#colors.text);
    vt.cursor.set(vt.buf, this.y + 1, this.x + 1);
    vt.write_text(
      vt.buf,
      [this.w - 1],
      `Input    : ${this.root.inputTime.toFixed(1)} ms`,
    );
    vt.cursor.set(vt.buf, this.y + 2, this.x + 1);
    vt.write_text(
      vt.buf,
      [this.w - 1],
      `Render   : ${this.root.renderTime.toFixed(1)} ms`,
    );
    vt.cursor.set(vt.buf, this.y + 3, this.x + 1);
    vt.write_text(vt.buf, [this.w - 1], `RSS      : ${rss} MiB`);
    vt.cursor.set(vt.buf, this.y + 4, this.x + 1);
    vt.write_text(
      vt.buf,
      [this.w - 1],
      `Heap     : ${heap_used}/${heap_total} MiB`,
    );
    vt.cursor.set(vt.buf, this.y + 5, this.x + 1);
    vt.write_text(vt.buf, [this.w - 1], `External : ${external_mem} MiB`);
    vt.buf.write(vt.cursor.restore);
  }

  async handle(cmd: Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.#area.background = this.#colors.background;
        break;

      case "Debug":
        this.#enabled = !this.#enabled;
        break;
    }
  }
}
