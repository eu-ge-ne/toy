import { clamp } from "@lib/std";
import { Area, clear, Control, render } from "@lib/ui";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";

const FLAG = " +";

export class Header extends Control {
  #file_path = "";
  #unsaved_flag = false;

  layout({ y, x, w, h }: Area): void {
    this.w = w;
    this.h = clamp(1, 0, h);

    this.y = y;
    this.x = x;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    vt.bsu();

    vt.flush_buf(
      vt.cursor.hide,
      vt.cursor.save,
      colors.BACKGROUND,
      ...clear.area(this),
      vt.cursor.set(this.y, this.x),
      ...render.text(
        [this.w],
        "center",
        colors.FILE_PATH,
        this.#file_path,
        ...(this.#unsaved_flag ? [colors.UNSAVED_FLAG, FLAG] : []),
      ),
      vt.cursor.restore,
      vt.cursor.show,
    );

    vt.esu();
  }

  set_file_path(x: string): void {
    this.#file_path = x;

    this.render();
  }

  set_unsaved_flag(x: boolean): void {
    this.#unsaved_flag = x;

    this.render();
  }
}
