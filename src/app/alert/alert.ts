import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const defaultColors = colors(DefaultTheme);

interface AlertEvents {
  uiChanged: unknown;
}

export class Alert extends ui.Component<AlertEvents> {
  #enabled = false;

  protected override children: {
    bg: ui.Bg;
    text: ui.MultiLineText;
    footer: ui.Text;
  };

  constructor() {
    super();

    this.children = {
      bg: new ui.Bg(defaultColors.background),
      text: new ui.MultiLineText(defaultColors.text),
      footer: new ui.Text(defaultColors.text, "center"),
    };

    this.children.footer.value = "ENTER‧ok";
  }

  override resizeChildren(): void {
    const { bg, text, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width - 4, this.height - 2, this.y + 1, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  async run(err: unknown): Promise<void> {
    this.children.text.value = Error.isError(err)
      ? err.message
      : Deno.inspect(err);

    this.#enabled = true;

    this.emit("uiChanged", undefined);

    await this.#processInput();

    this.#enabled = false;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.bg.render();
    this.children.text.render();
    this.children.footer.render();
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme": {
        const c = colors(Themes[cmd.data]);

        this.children.bg.color = c.background;
        this.children.text.color = c.text;
        this.children.footer.color = c.text;

        break;
      }
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
