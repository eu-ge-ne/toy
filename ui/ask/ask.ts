import { InputReader, new_input_reader } from "@lib/input";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { ASK_BG, ASK_COLORS } from "@ui/theme";

export class Ask extends Modal<[string], boolean> {
  protected size = new Area(0, 0, 40, 7);

  #text = "";

  async open(text: string): Promise<boolean> {
    let input: InputReader | undefined;

    try {
      this.enabled = true;
      this.#text = text;

      const { promise, resolve } = Promise.withResolvers<boolean>();

      input = new_input_reader((key) => {
        if (typeof key !== "string") {
          switch (key.name) {
            case "ESC":
              resolve(false);
              return;
            case "ENTER":
              resolve(true);
              return;
          }
        }

        this.render();
      });

      return await promise;
    } finally {
      input?.releaseLock();

      this.enabled = false;
    }
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, y1, h, w } = this.area;

    vt.write(
      vt.bsu,
      vt.cursor.hide,
      ASK_BG,
      ...vt.clear(y0, x0, h, w),
    );

    let pos = 0;

    for (let y = y0 + 1; y < y1 - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const space = { len: w - 2 };
      const line = this.#text.slice(pos, pos + space.len);

      pos += line.length;

      vt.write(
        vt.cursor.set(y, x0 + 1),
        ASK_COLORS,
        ...vt.fmt.center(space, line),
      );
    }

    vt.write(
      vt.cursor.set(y1 - 2, x0),
      ...vt.fmt.center({ len: w }, "ESC [cancel]    ENTER [ok]"),
      vt.esu,
    );
  }
}
