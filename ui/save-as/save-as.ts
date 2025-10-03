import { clamp } from "@lib/std";
import { Area, Modal } from "@lib/ui";
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

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(colors.BACKGROUND);
    vt.clear_area(vt.buf, this);
    vt.cursor.set(vt.buf, this.y + 1, this.x);
    vt.buf.write(colors.TEXT);
    vt.write_text_center(vt.buf, [this.w], "Save As");
    vt.cursor.set(vt.buf, this.y + this.h - 2, this.x);
    vt.write_text_center(vt.buf, [this.w], "ESC‧cancel    ENTER‧ok");

    this.#editor.render();

    vt.sync.esu();
  }

  async #process_input(): Promise<string> {
    while (true) {
      const key = await vt.readKey();

      if (key instanceof Uint8Array) {
        this.parent?.render();
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

      if (this.#editor.handle_key(key)) {
        this.#editor.render();
      }
    }
  }
}
