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

  constructor(parent?: Control) {
    super(parent);
    this.#setZen(true);
  }

  layout({ y, x, w, h }: Area): void {
    this.w = w;
    this.h = clamp(1, 0, h);

    this.y = y;
    this.x = x;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.sync.bsu();

    const span: [number] = [this.w];

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this);
    vt.cursor.set(vt.buf, this.y, this.x);
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

  async handleCommand(command: commands.Command): Promise<boolean> {
    switch (command.name) {
      case "Theme":
        this.#colors = colors(Themes[command.data]);
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
