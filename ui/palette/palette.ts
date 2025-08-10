import { Area, clear, Modal, render } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

import * as colors from "./colors.ts";

const MAX_LIST_SIZE = 10;

export interface PaletteOption {
  id: string;
  description: string;
  shortcuts: string;
}

export class Palette
  extends Modal<[PaletteOption[]], PaletteOption | undefined> {
  #editor = new Editor(this, { multi_line: false });
  #area!: Area;

  #all: PaletteOption[] = [];
  #options: PaletteOption[] = [];
  #list_size = 0;
  #selected_index = 0;
  #scroll_index = 0;

  async open(options: PaletteOption[]): Promise<PaletteOption | undefined> {
    this.enabled = true;
    this.#editor.enabled = true;

    this.#all = options;
    this.#editor.buffer.text = "";
    this.#editor.reset(false);

    this.#filter();
    this.parent?.render();

    const result = await this.#process_input();

    this.enabled = false;
    this.#editor.enabled = false;

    return result;
  }

  layout(area: Area): void {
    this.#area = area;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    this.#resize();
    this.#scroll();

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      colors.BACKGROUND,
      ...clear.area(this),
    );

    if (this.#options.length === 0) {
      this.#render_empty();
    } else {
      this.#render_options();
    }

    this.#editor.render();

    vt.esu();
  }

  async #process_input(): Promise<PaletteOption | undefined> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.parent?.render();
          continue;
        }

        if (typeof key !== "string") {
          switch (key.name) {
            case "ESC":
              return;
            case "ENTER":
              return this.#options[this.#selected_index];
            case "UP":
              if (this.#options.length > 0) {
                this.#selected_index = Math.max(this.#selected_index - 1, 0);
                this.parent?.render();
              }
              continue;
            case "DOWN":
              if (this.#options.length > 0) {
                this.#selected_index = Math.min(
                  this.#selected_index + 1,
                  this.#options.length - 1,
                );
                this.parent?.render();
              }
              continue;
          }
        }

        if (this.#editor.handle_input(key)) {
          this.#filter();
          this.parent?.render();
        }
      }
    }
  }

  #filter(): void {
    const text = this.#editor.buffer.text.toUpperCase();

    if (!text) {
      this.#options = this.#all;
    } else {
      this.#options = this.#all.filter((x) =>
        x.description.toUpperCase().includes(text)
      );
    }

    this.#selected_index = 0;
  }

  #resize(): void {
    this.#list_size = Math.min(this.#options.length, MAX_LIST_SIZE);

    this.w = Math.min(60, this.#area.w);

    this.h = 3 + Math.max(this.#list_size, 1);
    if (this.h > this.#area.h) {
      this.h = this.#area.h;
      if (this.#list_size > 0) {
        this.#list_size = this.h - 3;
      }
    }

    this.y = this.#area.y + Math.trunc((this.#area.h - this.h) / 2);
    this.x = this.#area.x + Math.trunc((this.#area.w - this.w) / 2);

    this.#editor.layout({
      y: this.y + 1,
      x: this.x + 2,
      w: this.w - 4,
      h: 1,
    });
  }

  #scroll(): void {
    const delta = this.#selected_index - this.#scroll_index;
    if (delta < 0) {
      this.#scroll_index = this.#selected_index;
    } else if (delta >= this.#list_size) {
      this.#scroll_index = this.#selected_index - this.#list_size + 1;
    }
  }

  #render_empty(): void {
    vt.write_buf(
      vt.cursor.set(this.y + 2, this.x + 2),
      colors.OPTION,
      ...render.text([this.w - 4], "No matching commands"),
    );
  }

  #render_options(): void {
    let i = 0;
    let y = this.y + 2;

    while (true) {
      if (i === this.#list_size) {
        break;
      }
      const index = this.#scroll_index + i;
      const option = this.#options[index];
      if (!option) {
        break;
      }
      if (y === this.y + this.h) {
        break;
      }

      const span: render.Span = [this.w - 4];

      vt.write_buf(
        index === this.#selected_index ? colors.SELECTED_OPTION : colors.OPTION,
        vt.cursor.set(y, this.x + 2),
        ...render.text(span, option.description),
      );

      vt.write_buf(
        ...render.text(span, option.shortcuts.padStart(span[0])),
      );

      i += 1;
      y += 1;
    }
  }
}
