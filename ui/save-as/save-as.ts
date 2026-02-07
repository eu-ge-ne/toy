import * as commands from "@lib/commands";
import { clamp } from "@lib/std";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

import { colors } from "./colors.ts";

export class SaveAs extends Modal<[string], string> {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #editor: Editor;

  constructor(renderTree: () => void) {
    super(renderTree);

    this.#editor = new Editor({ multi_line: false }, renderTree);
  }

  async open(path: string): Promise<string> {
    const { buffer } = this.#editor;

    this.#enabled = true;
    this.#editor.enable(true);

    buffer.reset(path);
    this.#editor.reset(true);

    this.renderTree();

    const result = await this.#processInput();

    this.#enabled = false;
    this.#editor.enable(false);

    return result;
  }

  layout(p: Area): void {
    this.area.w = clamp(60, 0, p.w);
    this.area.h = clamp(10, 0, p.h);
    this.area.y = p.y + Math.trunc((p.h - this.area.h) / 2);
    this.area.x = p.x + Math.trunc((p.w - this.area.w) / 2);

    this.#editor.layout({
      y: this.area.y + 4,
      x: this.area.x + 2,
      w: this.area.w - 4,
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
    vt.clear_area(vt.buf, this.area);
    vt.cursor.set(vt.buf, this.area.y + 1, this.area.x);
    vt.buf.write(this.#colors.text);
    vt.write_text_center(vt.buf, [this.area.w], "Save As");
    vt.cursor.set(vt.buf, this.area.y + this.area.h - 2, this.area.x);
    vt.write_text_center(vt.buf, [this.area.w], "ESC‧cancel    ENTER‧ok");

    this.#editor.render();

    vt.sync.esu();
  }

  async #processInput(): Promise<string> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.renderTree();
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
          this.#editor.render();
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
