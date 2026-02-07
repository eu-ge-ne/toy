import * as commands from "@lib/commands";
import { sprintf } from "@std/fmt/printf";

import { Globals } from "@lib/globals";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export class Footer extends Component<Globals> {
  #colors = colors(DefaultTheme);
  #enabled = false;

  constructor(globals: Globals) {
    super(globals);

    this.#onZen();
  }

  async run(): Promise<void> {
    throw new Error("Not implemented");
  }

  resize(p: Area): void {
    this.area.w = p.w;
    this.area.h = clamp(1, 0, p.h);
    this.area.y = p.y + p.h - 1;
    this.area.x = p.x;
  }

  renderComponent(): void {
    if (!this.#enabled) {
      return;
    }

    const ln = this.globals.ln + 1;
    const col = this.globals.col + 1;
    const pct = this.globals.lnCount === 0
      ? 0
      : ((ln / this.globals.lnCount) * 100).toFixed(0);
    const cursorStatus = `${ln} ${col}  ${pct}% `;

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this.area);
    vt.buf.write(this.#colors.text);
    vt.write_text(
      vt.buf,
      [this.area.w],
      sprintf("%*s", this.area.w, cursorStatus),
    );
    vt.buf.write(vt.cursor.restore);
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
  }

  async handleCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        return true;

      case "Zen":
        this.#onZen();
        return true;
    }

    return false;
  }

  #onZen(): void {
    this.#enabled = !this.globals.zen;
  }
}
