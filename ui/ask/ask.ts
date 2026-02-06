import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { Themes } from "@lib/themes";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";

import * as colors from "./colors.ts";

export class Ask extends Modal<[string], boolean> {
  #enabled = false;
  #text = "";

  async open(text: string): Promise<boolean> {
    this.#text = text;

    this.#enabled = true;

    this.render();
    const result = await this.#process_input();

    this.#enabled = false;

    return result;
  }

  layout({ y, x, w, h }: Area): void {
    this.w = clamp(60, 0, w);
    this.h = clamp(7, 0, h);

    this.y = y + Math.trunc((h - this.h) / 2);
    this.x = x + Math.trunc((w - this.w) / 2);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(colors.BACKGROUND);
    vt.clear_area(vt.buf, this);

    let pos = 0;

    for (let y = this.y + 1; y < this.y + this.h - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const span: [number] = [this.w - 2];
      const line = this.#text.slice(pos, pos + span[0]);

      pos += line.length;

      vt.cursor.set(vt.buf, y, this.x + 1);
      vt.sync.write(colors.TEXT);
      vt.write_text_center(vt.buf, span, line);
    }

    vt.cursor.set(vt.buf, this.y + this.h - 2, this.x);
    vt.write_text_center(vt.buf, [this.w], "ESC‧no    ENTER‧yes");

    vt.buf.flush();
    vt.sync.esu();
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

  async handleCommand(command: commands.Command): Promise<boolean> {
    switch (command.name) {
      case "Theme":
        colors.setAskColors(Themes[command.data]);
        return true;
    }
    return false;
  }
}
