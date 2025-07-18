import { read_input } from "@lib/input";
import { Area, Modal } from "@lib/ui";
import {
  begin_write,
  clear,
  end_write,
  fmt_center,
  fmt_text,
  hide_cursor,
  set_cursor,
  write,
} from "@lib/vt";
import { ALERT_BG, ALERT_COLORS } from "@ui/theme";

export class Alert extends Modal<[unknown], void> {
  protected size = new Area(0, 0, 60, 10);

  #opened = false;
  #text = "";

  async open(err: unknown): Promise<void> {
    try {
      this.#opened = true;
      this.#text = Error.isError(err) ? err.message : Deno.inspect(err);

      this.render();

      while (true) {
        for await (const key of read_input()) {
          if (typeof key !== "string") {
            switch (key.name) {
              case "ESC":
              case "ENTER":
                return;
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
      ALERT_BG,
      ...clear(y0, x0, h, w),
    );

    let pos = 0;

    for (let y = y0 + 1; y < y1 - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const space = { len: w - 4 };
      const line = this.#text.slice(pos, pos + space.len);

      pos += line.length;

      write(
        set_cursor(y, x0 + 2),
        ALERT_COLORS,
        ...fmt_text(space, line),
      );
    }

    end_write(
      set_cursor(y1 - 2, x0),
      ...fmt_center({ len: w }, "ENTER [ok]"),
    );
  }
}
