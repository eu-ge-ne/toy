import { IRoot } from "@components/root";
import { Command } from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

const MIB = Math.pow(1024, 2);

export class Debug extends Component {
  #colors = colors(DefaultTheme);
  #enabled = false;

  constructor(private readonly root: IRoot) {
    super((a, p) => {
      a.w = clamp(30, 0, p.w);
      a.h = clamp(7, 0, p.h);
      a.y = p.y + p.h - this.h;
      a.x = p.x + p.w - this.w;
    });
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
    vt.clear_area(vt.buf, this);
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
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
  }

  async handle(cmd: Command): Promise<void> {
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
