import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const defaultColors = colors(DefaultTheme);

interface HeaderEvents {
  layoutChange: unknown;
}

interface HeaderState {
  zen: boolean;
  fileName: string;
  fileModified: boolean;
}

export class Header extends ui.Component<HeaderEvents> {
  #enabled = false;

  protected override children: {
    bg: ui.Bg;
    text: ui.Text;
  };

  constructor(readonly state: HeaderState) {
    super();

    this.children = {
      bg: new ui.Bg(defaultColors.background),
      text: new ui.Text(defaultColors.text, "center"),
    };

    this.#onZenChange();
  }

  override resizeChildren(): void {
    const { bg, text } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    this.children.bg.render();

    const f = this.state.fileModified ? " +" : "";
    this.children.text.value = `${this.state.fileName}${f}`;
    this.children.text.render();

    vt.buf.write(vt.cursor.restore);
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme": {
        const c = colors(Themes[cmd.data]);

        this.children.bg.color = c.background;
        this.children.text.color = c.text;

        break;
      }
      case "Zen":
        this.state.zen = !this.state.zen;
        this.#onZenChange();
        this.emit("layoutChange", undefined);
        break;
    }
  }

  #onZenChange(): void {
    this.#enabled = !this.state.zen;
  }
}
