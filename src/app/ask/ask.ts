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

  protected override children = {
    background: new ui.Background(this.#colors.background),
    text: new ui.MultiLineText(this.#colors.text, "center"),
    footer: new ui.Text(this.#colors.text, "center"),
  };

  constructor(private readonly root: IRoot) {
    super();

    this.children.footer.value = "ESC‧no    ENTER‧yes";
  }

  override resizeChildren(): void {
    const { background, text, footer } = this.children;

    background.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width - 4, this.height - 2, this.y + 1, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  async run(text: string): Promise<boolean> {
    this.children.text.value = text;

    this.#enabled = true;

    this.root.render();
    const result = await this.#processInput();

    this.#enabled = false;

    return result;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.background.render();
    this.children.text.render();
    this.children.footer.render();
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.children.background.color = this.#colors.background;
        this.children.text.color = this.#colors.text;
        this.children.footer.color = this.#colors.text;
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
