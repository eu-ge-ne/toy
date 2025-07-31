import { alert as theme } from "@lib/theme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";

export class Alert extends Modal<[unknown], void> {
  protected size = new Area(0, 0, 60, 10);

  #text = "";

  async open(err: unknown): Promise<void> {
    this.done = Promise.withResolvers();

    this.enabled = true;
    this.#text = Error.isError(err) ? err.message : Deno.inspect(err);

    this.render();

    await this.#process_input();

    this.enabled = false;
  }

  async #process_input(): Promise<void> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array || typeof key === "string") {
          this.parent?.render();
          continue;
        }

        switch (key.name) {
          case "ESC":
          case "ENTER":
            this.done.resolve();
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

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      theme.BACKGROUND,
      ...vt.clear(y0, x0, h, w),
    );

    let pos = 0;

    for (let y = y0 + 1; y < y1 - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const space = { len: w - 4 };
      const line = this.#text.slice(pos, pos + space.len);

      pos += line.length;

      vt.write_buf(
        vt.cursor.set(y, x0 + 2),
        theme.TEXT,
        ...vt.fmt.text(space, line),
      );
    }

    vt.flush_buf(
      vt.cursor.set(y1 - 2, x0),
      ...vt.fmt.center({ len: w }, "ENTER‧ok"),
    );

    vt.esu();
  }
}
