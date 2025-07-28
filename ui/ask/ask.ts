import { read_input } from "@lib/input";
import { ASK_BG, ASK_COLORS } from "@lib/theme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";

export class Ask extends Modal<[string], boolean> {
  protected size = new Area(0, 0, 60, 7);

  #text = "";

  async open(text: string): Promise<boolean> {
    this.done = Promise.withResolvers();

    this.enabled = true;
    this.#text = text;

    this.render();

    await this.#process_input();

    this.enabled = false;

    return this.done.promise;
  }

  async #process_input(): Promise<void> {
    while (true) {
      for await (const data of read_input()) {
        if (data instanceof Uint8Array || typeof data === "string") {
          continue;
        }

        switch (data.name) {
          case "ESC":
            this.done.resolve(false);
            return;
          case "ENTER":
            this.done.resolve(true);
            return;
        }
      }
    }
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, y1, h, w } = this.area;

    vt.begin_sync_write();

    vt.sync_write(
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

      vt.sync_write(
        vt.cursor.set(y, x0 + 1),
        ASK_COLORS,
        ...vt.fmt.center(space, line),
      );
    }

    vt.sync_write(
      vt.cursor.set(y1 - 2, x0),
      ...vt.fmt.center({ len: w }, "ESC‧no    ENTER‧yes"),
    );

    vt.end_sync_write();
  }
}
