import * as commands from "@lib/commands";
import { Globals } from "@lib/globals";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export class Header extends Component<Globals> {
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
    this.area.y = p.y;
    this.area.x = p.x;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.sync.bsu();

    const span: [number] = [this.area.w];

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this.area);
    vt.cursor.set(vt.buf, this.area.y, this.area.x);
    vt.buf.write(this.#colors.filePath);
    vt.write_text_center(vt.buf, span, this.globals.filePath);

    if (this.globals.isDirty) {
      vt.buf.write(this.#colors.isDirty);
      vt.write_text(vt.buf, span, " +");
    }

    vt.buf.write(vt.cursor.restore);
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
  }

  async handle(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        break;

      case "Zen":
        this.#onZen();
        this.globals.isLayoutDirty = true;
        break;
    }
  }

  #onZen(): void {
    this.#enabled = !this.globals.zen;
  }
}
