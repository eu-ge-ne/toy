import * as commands from "@lib/commands";
import { Area, Control, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

import * as colors from "./colors.ts";
import { PaletteOption } from "./option.ts";

const MAX_LIST_SIZE = 10;

export class Palette
  extends Modal<[PaletteOption[]], commands.Command | undefined> {
  #options: PaletteOption[] = commands.All.map((x) => new PaletteOption(x));

  #editor = new Editor(this, { multi_line: false });
  #area!: Area;

  #filtered_options: PaletteOption[] = [];
  #list_size = 0;
  #selected_index = 0;
  #scroll_index = 0;

  constructor(parent: Control) {
    super(parent);
  }

  async open(): Promise<commands.Command | undefined> {
    this.enabled = true;
    this.#editor.enabled = true;

    this.#editor.buffer.reset();
    this.#editor.reset(false);

    this.#filter();
    this.parent?.render();

    const command = await this.#process_input();

    this.enabled = false;
    this.#editor.enabled = false;

    return command;
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

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(colors.BACKGROUND);
    vt.clear_area(vt.buf, this);

    if (this.#filtered_options.length === 0) {
      this.#render_empty();
    } else {
      this.#render_options();
    }

    this.#editor.render();

    vt.sync.esu();
  }

  async #process_input(): Promise<commands.Command | undefined> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.parent?.render();
          continue;
        }

        switch (key.name) {
          case "ESC":
            return;
          case "ENTER":
            return this.#filtered_options[this.#selected_index]?.command;
          case "UP":
            if (this.#filtered_options.length > 0) {
              this.#selected_index = Math.max(this.#selected_index - 1, 0);
              this.parent?.render();
            }
            continue;
          case "DOWN":
            if (this.#filtered_options.length > 0) {
              this.#selected_index = Math.min(
                this.#selected_index + 1,
                this.#filtered_options.length - 1,
              );
              this.parent?.render();
            }
            continue;
        }

        if (this.#editor.handleKey(key)) {
          this.#filter();
          this.parent?.render();
        }
      }
    }
  }

  #filter(): void {
    const text = this.#editor.buffer.text().toUpperCase();

    if (!text) {
      this.#filtered_options = this.#options;
    } else {
      this.#filtered_options = this.#options.filter((x) =>
        x.command.description.toUpperCase().includes(text)
      );
    }

    this.#selected_index = 0;
  }

  #resize(): void {
    this.#list_size = Math.min(this.#filtered_options.length, MAX_LIST_SIZE);

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
    vt.cursor.set(vt.buf, this.y + 2, this.x + 2);
    vt.buf.write(colors.OPTION);
    vt.write_text(vt.buf, [this.w - 4], "No matching commands");
  }

  #render_options(): void {
    let i = 0;
    let y = this.y + 2;

    while (true) {
      if (i === this.#list_size) {
        break;
      }
      const index = this.#scroll_index + i;
      const option = this.#filtered_options[index];
      if (!option) {
        break;
      }
      if (y === this.y + this.h) {
        break;
      }

      const span: [number] = [this.w - 4];

      vt.buf.write(
        index === this.#selected_index ? colors.SELECTED_OPTION : colors.OPTION,
      );
      vt.cursor.set(vt.buf, y, this.x + 2);
      vt.write_text(vt.buf, span, option.command.description);
      vt.write_text(vt.buf, span, option.shortcuts.padStart(span[0]));

      i += 1;
      y += 1;
    }
  }
}
