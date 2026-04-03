import { Editor } from "@components/editor";
import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Save extends Component {
  #colors = colors(DefaultTheme);
  #area = new Area(this.#colors.background);
  #editor: Editor;
  #enabled = false;

  constructor(private readonly root: IRoot) {
    super();

    this.#editor = new Editor(root, { multiLine: false });
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

  layout(): void {
    this.#area.resize(this.width, this.height, this.y, this.x);
    this.#editor.resize(this.width - 4, 1, this.y + 4, this.x + 2);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.#area.render();
    vt.cursor.set(vt.buf, this.y + 1, this.x);
    vt.buf.write(this.#colors.text);
    vt.write_text_center(vt.buf, [this.width], "Save As");
    vt.cursor.set(vt.buf, this.y + this.height - 2, this.x);
    vt.write_text_center(vt.buf, [this.width], "ESC‧cancel    ENTER‧ok");

    this.#editor.render();
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.#area.background = this.#colors.background;
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
