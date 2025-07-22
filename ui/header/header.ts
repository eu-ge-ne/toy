import { Control } from "@lib/ui";
import * as vt from "@lib/vt";
import {
  HEADER_BG,
  HEADER_FILE_PATH_COLORS,
  HEADER_UNSAVED_FLAG_COLORS,
} from "@ui/theme";

const FLAG = " +";

export class Header extends Control {
  #file_path = "";
  #unsaved_flag = false;

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, h, w } = this.area;

    vt.sync_write(
      vt.cursor.save,
      HEADER_BG,
      ...vt.clear(y0, x0, h, w),
      vt.cursor.set(y0, x0),
      ...vt.fmt.center(
        { len: w },
        HEADER_FILE_PATH_COLORS,
        this.#file_path,
        ...(this.#unsaved_flag ? [HEADER_UNSAVED_FLAG_COLORS, FLAG] : []),
      ),
      vt.cursor.restore,
    );
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
