import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export class Ask extends Component<[string], boolean> {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #text = "";

  async run(text: string): Promise<boolean> {
    this.#text = text;

    this.#enabled = true;

    this.renderTree();
    const result = await this.#processInput();

    this.#enabled = false;

    return result;
  }

  resize(p: Area): void {
    this.area.w = clamp(60, 0, p.w);
    this.area.h = clamp(7, 0, p.h);
    this.area.y = p.y + Math.trunc((p.h - this.area.h) / 2);
    this.area.x = p.x + Math.trunc((p.w - this.area.w) / 2);
  }

  renderComponent(): void {
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

  async #processInput(): Promise<boolean> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array || typeof key === "string") {
          this.renderTree();
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
