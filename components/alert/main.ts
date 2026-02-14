import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Alert extends Component {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #text = "";

  constructor(private readonly root: IRoot) {
    super((a, p) => {
      a.w = clamp(60, 0, p.w);
      a.h = clamp(10, 0, p.h);
      a.y = p.y + Math.trunc((p.h - this.h) / 2);
      a.x = p.x + Math.trunc((p.w - this.w) / 2);
    });
  }

  async run(err: unknown): Promise<void> {
    this.#text = Error.isError(err) ? err.message : Deno.inspect(err);

    this.#enabled = true;

    this.root.render();
    await this.#processInput();

    this.#enabled = false;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this);

    let pos = 0;

    for (let y = this.y + 1; y < this.y + this.h - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const span: [number] = [this.w - 4];
      const line = this.#text.slice(pos, pos + span[0]);

      pos += line.length;

      vt.cursor.set(vt.buf, y, this.x + 2);
      vt.buf.write(this.#colors.text);
      vt.write_text(vt.buf, span, line);
    }

    vt.cursor.set(vt.buf, this.y + this.h - 2, this.x);
    vt.write_text_center(vt.buf, [this.w], "ENTER‧ok");
  }

  async handle(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        break;
    }
  }

  async #processInput(): Promise<void> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
        case "ENTER":
          return;
      }
    }
  }
}
