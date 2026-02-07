import * as commands from "@lib/commands";
import { Globals } from "@lib/globals";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

import { colors } from "./colors.ts";

export class SaveAs extends Component<Globals, [string], string> {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #editor: Editor;

  constructor(globals: Globals) {
    super(globals);

    this.#editor = new Editor(globals, { multiLine: false });
  }

  async run(path: string): Promise<string> {
    const { buffer } = this.#editor;

    this.#enabled = true;
    this.#editor.enable(true);

    buffer.reset(path);
    this.#editor.reset(true);

    this.globals.renderTree();

    const result = await this.#processInput();

    this.#enabled = false;
    this.#editor.enable(false);

    return result;
  }

  resize(p: Area): void {
    this.area.w = clamp(60, 0, p.w);
    this.area.h = clamp(10, 0, p.h);
    this.area.y = p.y + Math.trunc((p.h - this.area.h) / 2);
    this.area.x = p.x + Math.trunc((p.w - this.area.w) / 2);

    this.#editor.resize({
      y: this.area.y + 4,
      x: this.area.x + 2,
      w: this.area.w - 4,
      h: 1,
    });
  }

  renderComponent(): void {
    if (!this.#enabled) {
      return;
    }

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this.area);
    vt.cursor.set(vt.buf, this.area.y + 1, this.area.x);
    vt.buf.write(this.#colors.text);
    vt.write_text_center(vt.buf, [this.area.w], "Save As");
    vt.cursor.set(vt.buf, this.area.y + this.area.h - 2, this.area.x);
    vt.write_text_center(vt.buf, [this.area.w], "ESC‧cancel    ENTER‧ok");

    this.#editor.renderComponent();

    vt.sync.esu();
  }

  async #processInput(): Promise<string> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.globals.renderTree();
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

        if (this.#editor.handleKey(key)) {
          this.globals.renderTree();
        }
      }
    }
  }

  async handleCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        return true;
    }

    return false;
  }
}
