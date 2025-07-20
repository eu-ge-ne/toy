import { Pane } from "@lib/ui";
import * as vt from "@lib/vt";
import {
  HEADER_BG,
  HEADER_FILE_PATH_COLORS,
  HEADER_FLAG_OFF_COLORS,
  HEADER_FLAG_ON_COLORS,
} from "@ui/theme";

const FLAG = "+";

export class Header extends Pane {
  #file_path = "";
  #has_changes = true;

  render(): void {
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
        this.#has_changes ? HEADER_FLAG_ON_COLORS : HEADER_FLAG_OFF_COLORS,
        FLAG,
      ),
      vt.cursor.restore,
    );
  }

  set_file_path(x: string): void {
    this.#file_path = x;
    this.render();
  }

  set_has_changes(x: boolean): void {
    this.#has_changes = x;
    this.render();
  }
}
