import { clamp } from "@lib/std";
import { Area, Control } from "@lib/ui";
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

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(vt.cursor.save);
    vt.buf.write(colors.BACKGROUND);
    vt.clear_area(vt.buf, this);
    vt.cursor.set(vt.buf, this.y, this.x);
    vt.write_text_center(
      vt.buf,
      [this.w],
      colors.FILE_PATH,
      this.#file_path,
      ...(this.#unsaved_flag ? [colors.UNSAVED_FLAG, FLAG] : []),
    ), vt.buf.write(vt.cursor.restore);
    vt.buf.write(vt.cursor.show);

    vt.buf.flush();
    vt.sync.esu();
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
