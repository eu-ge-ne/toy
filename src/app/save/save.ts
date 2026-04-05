import { Editor } from "@components/editor";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const defaultColors = colors(DefaultTheme);

interface SaveEvents {
  uiChanged: unknown;
}

export class Save extends ui.Component<SaveEvents> {
  #enabled = false;

  protected override children: {
    bg: ui.Bg;
    header: ui.Text;
    editor: Editor;
    footer: ui.Text;
  };

  constructor() {
    super();

    this.children = {
      bg: new ui.Bg(defaultColors.background),
      header: new ui.Text(defaultColors.text, "center"),
      editor: new Editor({ multiLine: false }),
      footer: new ui.Text(defaultColors.text, "center"),
    };

    this.children.header.value = "Save As";
    this.children.footer.value = "ESC‧cancel    ENTER‧ok";
  }

  override resizeChildren(): void {
    const { bg, header, editor, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    header.resize(this.width, 1, this.y + 1, this.x);
    editor.resize(this.width - 4, 1, this.y + 4, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  async run(path: string): Promise<string> {
    this.#enabled = true;
    this.children.editor.enable(true);

    this.children.editor.textBuf.reset(path);
    this.children.editor.reset(true);

    this.emit("uiChanged", undefined);

    const result = await this.#processInput();

    this.#enabled = false;
    this.children.editor.enable(false);

    return result;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.bg.render();
    this.children.header.render();
    this.children.footer.render();
    this.children.editor.render();
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme": {
        const c = colors(Themes[cmd.data]);

        this.children.bg.color = c.background;
        this.children.footer.color = c.text;

        break;
      }
    }
  }

  async #processInput(): Promise<string> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return "";
        case "ENTER": {
          const path = this.children.editor.textBuf.text();
          if (path) {
            return path;
          }
        }
      }

      this.children.editor.handleKey(key);

      this.emit("uiChanged", undefined);
    }
  }
}
