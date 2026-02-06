import * as commands from "@lib/commands";
import { sprintf } from "@std/fmt/printf";

import { clamp } from "@lib/std";
import { Themes } from "@lib/themes";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";

export class Footer extends Control {
  #zen = true;
  #cursor_status = "";

  constructor(parent?: Control) {
    super(parent);
    this.#setZen(true);
  }

  layout({ y, x, w, h }: Area): void {
    this.w = w;
    this.h = clamp(1, 0, h);

    this.y = y + h - 1;
    this.x = x;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(colors.BACKGROUND);
    vt.clear_area(vt.buf, this);
    vt.buf.write(colors.TEXT);
    vt.write_text(
      vt.buf,
      [this.w],
      sprintf("%*s", this.w, this.#cursor_status),
    );
    vt.buf.write(vt.cursor.restore);
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
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

    this.#cursor_status = `${ln} ${col}  ${pct}% `;

    this.render();
  }

  async handleCommand(command: commands.Command): Promise<boolean> {
    switch (command.name) {
      case "Theme":
        colors.setFooterColors(Themes[command.data]);
        return true;

      case "Zen":
        this.#setZen();
        return true;
    }

    return false;
  }

  #setZen(x?: boolean): void {
    if (typeof x === "undefined") {
      x = !this.#zen;
    }
    this.#zen = x;
    this.enabled = !x;
  }
}
