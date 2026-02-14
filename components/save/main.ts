import { Editor } from "@components/editor";
import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Save extends Component {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #editor: Editor;

  constructor(private readonly root: IRoot) {
    super((a, p) => {
      a.w = clamp(60, 0, p.w);
      a.h = clamp(10, 0, p.h);
      a.y = p.y + Math.trunc((p.h - this.h) / 2);
      a.x = p.x + Math.trunc((p.w - this.w) / 2);

      this.#editor.layout(this);
    });

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

  layout2(): void {
    this.#editor.resize(this.y + 4, this.x + 2, this.w - 4, 1);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this);
    vt.cursor.set(vt.buf, this.y + 1, this.x);
    vt.buf.write(this.#colors.text);
    vt.write_text_center(vt.buf, [this.w], "Save As");
    vt.cursor.set(vt.buf, this.y + this.h - 2, this.x);
    vt.write_text_center(vt.buf, [this.w], "ESC‧cancel    ENTER‧ok");

    this.#editor.render();
  }

  async handle(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
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
