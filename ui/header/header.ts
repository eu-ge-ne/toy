import { Pane } from "@lib/ui";
import {
  clear,
  fmt_center,
  restore_cursor,
  save_cursor,
  set_cursor,
  sync_write,
} from "@lib/vt";
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

    sync_write(
      save_cursor,
      HEADER_BG,
      ...clear(y0, x0, h, w),
      set_cursor(y0, x0),
      ...fmt_center(
        { len: w },
        HEADER_FILE_PATH_COLORS,
        this.#file_path,
        this.#has_changes ? HEADER_FLAG_ON_COLORS : HEADER_FLAG_OFF_COLORS,
        FLAG,
      ),
      restore_cursor,
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
