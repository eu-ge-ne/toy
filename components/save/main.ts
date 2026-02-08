import { Editor } from "@components/editor";
import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Save extends Component<[string], string> {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #editor: Editor;

  constructor(private readonly root: IRoot) {
    super();

    this.#editor = new Editor(root, { multiLine: false });
  }

  async run(path: string): Promise<string> {
    this.#enabled = true;
    this.#editor.enable(true);

    this.#editor.buffer.reset(path);
    this.#editor.reset(true);

    this.root.render();

    const result = await this.#processInput();

    this.#enabled = false;
    this.#editor.enable(false);

    return result;
  }

  layout(p: Area): void {
    this.w = clamp(60, 0, p.w);
    this.h = clamp(10, 0, p.h);
    this.y = p.y + Math.trunc((p.h - this.h) / 2);
    this.x = p.x + Math.trunc((p.w - this.w) / 2);

    this.#editor.layout({
      y: this.y + 4,
      x: this.x + 2,
      w: this.w - 4,
      h: 1,
    });
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this);
    vt.cursor.set(vt.buf, this.y + 1, this.x);
    vt.buf.write(this.#colors.text);
    vt.write_text_center(vt.buf, [this.w], "Save As");
    vt.cursor.set(vt.buf, this.y + this.h - 2, this.x);
    vt.write_text_center(vt.buf, [this.w], "ESC‧cancel    ENTER‧ok");

    this.#editor.render();

    vt.sync.esu();
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
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.root.render();
          continue;
        }

        switch (key.name) {
          case "ESC":
            return "";
          case "ENTER": {
            const path = this.#editor.buffer.text();
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
}
