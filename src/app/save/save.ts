import { Editor } from "@components/editor";
import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Save extends ui.Component {
  #colors = colors(DefaultTheme);
  #editor: Editor;
  #enabled = false;

  protected override children = {
    background: new ui.Background(this.#colors.background),
    header: new ui.Text(this.#colors.text, "center"),
    footer: new ui.Text(this.#colors.text, "center"),
  };

  constructor(private readonly root: IRoot) {
    super();

    this.children.header.value = "Save As";
    this.children.footer.value = "ESC‧cancel    ENTER‧ok";
    this.#editor = new Editor(root, { multiLine: false });
  }

  override resizeChildren(): void {
    this.children.background.resize(this.width, this.height, this.y, this.x);

    this.children.header.resize(
      this.width,
      1,
      this.y + 1,
      this.x,
    );

    this.children.footer.resize(
      this.width,
      1,
      this.y + this.height - 2,
      this.x,
    );

    this.#editor.resize(this.width - 4, 1, this.y + 4, this.x + 2);
  }

  async run(path: string): Promise<string> {
    this.#enabled = true;
    this.#editor.enable(true);

    this.#editor.textBuf.reset(path);
    this.#editor.reset(true);

    this.root.render();

    const result = await this.#processInput();

    this.#enabled = false;
    this.#editor.enable(false);

    return result;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.background.render();
    this.children.header.render();
    this.children.footer.render();
    this.#editor.render();
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.children.background.color = this.#colors.background;
        this.children.footer.color = this.#colors.text;
        break;
    }
  }

  async #processInput(): Promise<string> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return "";
        case "ENTER": {
          const path = this.#editor.textBuf.text();
          if (path) {
            return path;
          }
        }
      }

      this.#editor.handleKey(key);
      this.root.render();
    }
  }
}
