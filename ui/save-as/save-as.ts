import { clamp, iter_to_str } from "@lib/std";
import { Area, clear, Modal, render } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

import * as colors from "./colors.ts";

export class SaveAs extends Modal<[string], string> {
  #editor = new Editor(this, { multi_line: false });

  async open(path: string): Promise<string> {
    const { buffer } = this.#editor;

    this.enabled = true;
    this.#editor.enabled = true;

    buffer.reset(path);
    this.#editor.reset(true);

    this.render();

    const result = await this.#process_input();

    this.enabled = false;
    this.#editor.enabled = false;

    return result;
  }

  layout({ y, x, w, h }: Area): void {
    this.w = clamp(60, 0, w);
    this.h = clamp(10, 0, h);

    this.y = y + Math.trunc((h - this.h) / 2);
    this.x = x + Math.trunc((w - this.w) / 2);

    this.#editor.layout({
      y: this.y + 4,
      x: this.x + 2,
      w: this.w - 4,
      h: 1,
    });
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      colors.BACKGROUND,
      ...clear.area(this),
      vt.cursor.set(this.y + 1, this.x),
      colors.TEXT,
      ...render.text([this.w], "center", "Save As"),
      vt.cursor.set(this.y + this.h - 2, this.x),
      ...render.text([this.w], "center", "ESC‧cancel    ENTER‧ok"),
    );

    this.#editor.render();

    vt.esu();
  }

  async #process_input(): Promise<string> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.parent?.render();
          continue;
        }

        if (typeof key !== "string") {
          switch (key.name) {
            case "ESC":
              return "";
            case "ENTER": {
              const path = iter_to_str(this.#editor.buffer.read(0));
              if (path) {
                return path;
              }
            }
          }
        }

        if (this.#editor.handle_input(key)) {
          this.#editor.render();
        }
      }
    }
  }
}
