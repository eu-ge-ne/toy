import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Footer extends ui.Component {
  #colors = colors(DefaultTheme);
  #enabled = false;

  protected override children = {
    background: new ui.Background(this.#colors.background),
    text: new ui.Text(this.#colors.text, "right"),
  };

  constructor(private readonly root: IRoot) {
    super();

    this.#onZen();
  }

  override resizeChildren(): void {
    this.children.background.resize(this.width, this.height, this.y, this.x);
    this.children.text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.background.render();

    const ln = this.root.ln + 1;
    const col = this.root.col + 1;
    const pct = this.root.lnCount === 0
      ? 0
      : ((ln / this.root.lnCount) * 100).toFixed(0);
    this.children.text.value = `${ln} ${col}  ${pct}% `;
    this.children.text.render();
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.children.background.color = this.#colors.background;
        this.children.text.color = this.#colors.text;
        break;
      case "Zen":
        this.#onZen();
        this.root.isLayoutDirty = true;
        break;
    }
  }

  #onZen(): void {
    this.#enabled = !this.root.zen;
  }
}
