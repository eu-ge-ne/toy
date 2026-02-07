import * as commands from "@lib/commands";
import { sprintf } from "@std/fmt/printf";

import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export class Footer extends Control {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #zen = true;
  #cursor_status = "";

  constructor(parent?: Control) {
    super(parent);
    this.#setZen(true);
  }

  layout(parentArea: Area): void {
    this.area.w = parentArea.w;
    this.area.h = clamp(1, 0, parentArea.h);
    this.area.y = parentArea.y + parentArea.h - 1;
    this.area.x = parentArea.x;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this.area);
    vt.buf.write(this.#colors.text);
    vt.write_text(
      vt.buf,
      [this.area.w],
      sprintf("%*s", this.area.w, this.#cursor_status),
    );
    vt.buf.write(vt.cursor.restore);
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
  }

  set_cursor_status(data: { ln: number; col: number; ln_count: number }): void {
    if (!this.#enabled) {
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

  async handleCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
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
    this.#enabled = !x;
  }
}
