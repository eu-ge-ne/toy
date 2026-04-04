import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const defaultColors = colors(DefaultTheme);

export class Header extends ui.Component {
  #enabled = false;

  protected override children = {
    background: new ui.Background(defaultColors.background),
    text: new ui.Text(defaultColors.text, "center"),
  };

  constructor(private readonly root: IRoot) {
    super();

    this.#onZen();
  }

  override resizeChildren(): void {
    const { background, text } = this.children;

    background.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    this.children.background.render();

    const f = this.root.isDirty ? " +" : "";
    this.children.text.value = `${this.root.filePath}${f}`;
    this.children.text.render();

    vt.buf.write(vt.cursor.restore);
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme": {
        const c = colors(Themes[cmd.data]);

        this.children.background.color = c.background;
        this.children.text.color = c.text;

        break;
      }
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
