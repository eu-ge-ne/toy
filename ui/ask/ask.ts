import { clamp } from "@lib/std";
import { ask as theme } from "@lib/theme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";

export class Ask extends Modal<[string], boolean> {
  #text = "";

  async open(text: string): Promise<boolean> {
    this.#text = text;

    this.enabled = true;

    this.render();
    const result = await this.#process_input();

    this.enabled = false;

    return result;
  }

  layout({ y, x, w, h }: Area): void {
    this.w = clamp(60, 0, w);
    this.h = clamp(7, 0, h);

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
      theme.BACKGROUND,
      ...vt.clear(this),
    );

    let pos = 0;

    for (let y = this.y + 1; y < this.y + this.h - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const space = { len: this.w - 2 };
      const line = this.#text.slice(pos, pos + space.len);

      pos += line.length;

      vt.write_buf(
        vt.cursor.set(y, this.x + 1),
        theme.TEXT,
        ...vt.fmt.center(space, line),
      );
    }

    vt.flush_buf(
      vt.cursor.set(this.y + this.h - 2, this.x),
      ...vt.fmt.center({ len: this.w }, "ESC‧no    ENTER‧yes"),
    );

    vt.esu();
  }

  async #process_input(): Promise<boolean> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array || typeof key === "string") {
          this.parent?.render();
          continue;
        }

        switch (key.name) {
          case "ESC":
            return false;
          case "ENTER":
            return true;
        }
      }
    }
  }
}
