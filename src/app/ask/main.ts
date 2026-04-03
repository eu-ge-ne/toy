import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Ask extends ui.Component {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #text = "";

  protected override children = {
    background: new ui.Background(this.#colors.background),
  };

  constructor(private readonly root: IRoot) {
    super();
  }

  async run(text: string): Promise<boolean> {
    this.#text = text;

    this.#enabled = true;

    this.root.render();
    const result = await this.#processInput();

    this.#enabled = false;

    return result;
  }

  override resizeChildren(): void {
    this.children.background.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.background.render();

    let pos = 0;

    for (let y = this.y + 1; y < this.y + this.height - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const span: [number] = [this.width - 2];
      const line = this.#text.slice(pos, pos + span[0]);

      pos += line.length;

      vt.cursor.set(vt.buf, y, this.x + 1);
      vt.sync.write(this.#colors.text);
      vt.write_text_center(vt.buf, span, line);
    }

    vt.cursor.set(vt.buf, this.y + this.height - 2, this.x);
    vt.write_text_center(vt.buf, [this.width], "ESC‧no    ENTER‧yes");
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.children.background.color = this.#colors.background;
        break;
    }
  }

  async #processInput(): Promise<boolean> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return false;
        case "ENTER":
          return true;
      }
    }
  }
}
