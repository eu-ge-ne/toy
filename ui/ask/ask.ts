import { read_input } from "@lib/input";
import { Area, Modal } from "@lib/ui";
import {
  begin_write,
  clear,
  end_write,
  fmt_center,
  hide_cursor,
  set_cursor,
  write,
} from "@lib/vt";
import { ASK_BG, ASK_COLORS } from "@ui/theme";

export class Ask extends Modal<[string], boolean> {
  protected size = new Area(0, 0, 40, 7);

  #opened = false;
  #text = "";

  async open(text: string): Promise<boolean> {
    try {
      this.#opened = true;
      this.#text = text;

      this.render();

      while (true) {
        for await (const key of read_input()) {
          if (typeof key !== "string") {
            switch (key.name) {
              case "ESC":
                return false;
              case "ENTER":
                return true;
            }
          }
        }
      }
    } finally {
      this.#opened = false;
    }
  }

  render(): void {
    if (!this.#opened) {
      return;
    }

    const { y0, x0, y1, h, w } = this.area;

    begin_write(
      hide_cursor,
      ASK_BG,
      ...clear(y0, x0, h, w),
    );

    let pos = 0;

    for (let y = y0 + 1; y < y1 - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const space = { len: w - 2 };
      const line = this.#text.slice(pos, pos + space.len);

      pos += line.length;

      write(
        set_cursor(y, x0 + 1),
        ASK_COLORS,
        ...fmt_center(space, line),
      );
    }

    end_write(
      set_cursor(y1 - 2, x0),
      ...fmt_center({ len: w }, "ESC [cancel]    ENTER [ok]"),
    );
  }
}
