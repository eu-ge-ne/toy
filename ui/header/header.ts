import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export class Header extends Control {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #zen = true;
  #file_path = "";
  #flag = false;

  constructor(parent: Control) {
    super(parent);
    this.#setZen(true);
  }

  layout(parentArea: Area): void {
    this.area.w = parentArea.w;
    this.area.h = clamp(1, 0, parentArea.h);
    this.area.y = parentArea.y;
    this.area.x = parentArea.x;
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
    vt.write_text_center(vt.buf, span, this.#file_path);

    if (this.#flag) {
      vt.buf.write(this.#colors.unsavedFlag);
      vt.write_text(vt.buf, span, " +");
    }

    vt.buf.write(vt.cursor.restore);
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
  }

  set_file_path(x: string): void {
    this.#file_path = x;

    this.render();
  }

  set_unsaved_flag(x: boolean): void {
    this.#flag = x;

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
