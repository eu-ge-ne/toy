import { clamp } from "@lib/std";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";

export class Alert extends Modal<[unknown], void> {
  #text = "";

  async open(err: unknown): Promise<void> {
    this.#text = Error.isError(err) ? err.message : Deno.inspect(err);

    this.enabled = true;

    this.render();
    await this.#process_input();

    this.enabled = false;
  }

  layout({ y, x, w, h }: Area): void {
    this.w = clamp(60, 0, w);
    this.h = clamp(10, 0, h);

    this.y = y + Math.trunc((h - this.h) / 2);
    this.x = x + Math.trunc((w - this.w) / 2);
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      colors.BACKGROUND,
      ...vt.clear(this),
    );

    let pos = 0;

    for (let y = this.y + 1; y < this.y + this.h - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const space = { len: this.w - 4 };
      const line = this.#text.slice(pos, pos + space.len);

      pos += line.length;

      vt.write_buf(
        vt.cursor.set(y, this.x + 2),
        colors.TEXT,
        ...vt.fmt.text(space, line),
      );
    }

    vt.flush_buf(
      vt.cursor.set(this.y + this.h - 2, this.x),
      ...vt.fmt.center({ len: this.w }, "ENTER‧ok"),
    );

    vt.esu();
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
            return;
        }
      }
    }
  }
}
