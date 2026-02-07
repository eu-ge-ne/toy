import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export class Ask extends Modal<[string], boolean> {
  #colors = colors(DefaultTheme);
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

  layout(parentArea: Area): void {
    this.area.w = clamp(60, 0, parentArea.w);
    this.area.h = clamp(7, 0, parentArea.h);
    this.area.y = parentArea.y + Math.trunc((parentArea.h - this.area.h) / 2);
    this.area.x = parentArea.x + Math.trunc((parentArea.w - this.area.w) / 2);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this.area);

    let pos = 0;

    for (let y = this.area.y + 1; y < this.area.y + this.area.h - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const span: [number] = [this.area.w - 2];
      const line = this.#text.slice(pos, pos + span[0]);

      pos += line.length;

      vt.cursor.set(vt.buf, y, this.area.x + 1);
      vt.sync.write(this.#colors.text);
      vt.write_text_center(vt.buf, span, line);
    }

    vt.cursor.set(vt.buf, this.area.y + this.area.h - 2, this.area.x);
    vt.write_text_center(vt.buf, [this.area.w], "ESC‧no    ENTER‧yes");

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

  async handleCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        return true;
    }

    return false;
  }
}
