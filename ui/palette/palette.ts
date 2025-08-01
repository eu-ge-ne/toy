import { palette as theme } from "@lib/theme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

const MAX_LIST_SIZE = 10;

export interface PaletteOption {
  id: string;
  description: string;
  shortcuts: string;
}

export class Palette
  extends Modal<[PaletteOption[]], PaletteOption | undefined> {
  protected size = new Area(0, 0, 0, 0);

  #editor = new Editor(this, { multi_line: false });
  #parent_area!: Area;

  #all: PaletteOption[] = [];
  #options: PaletteOption[] = [];
  #list_size = 0;
  #selected_index = 0;
  #scroll_index = 0;

  async open(options: PaletteOption[]): Promise<PaletteOption | undefined> {
    this.done = Promise.withResolvers();

    this.enabled = true;
    this.#editor.enabled = true;

    this.#all = options;
    this.#editor.buffer.set_text("");
    this.#editor.reset(false);

    this.#filter();
    this.parent?.render();

    await this.#process_input();

    this.enabled = false;
    this.#editor.enabled = false;

    return this.done.promise;
  }

  async #process_input(): Promise<void> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.parent?.render();
          continue;
        }

        if (typeof key !== "string") {
          switch (key.name) {
            case "ESC":
              this.done.resolve(undefined);
              return;
            case "ENTER":
              this.done.resolve(this.#options[this.#selected_index]);
              return;
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

  override resize(area: Area): void {
    this.#parent_area = area;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    vt.bsu();

    this.#resize();
    this.#scroll();

    vt.write_buf(
      vt.cursor.hide,
      theme.BACKGROUND,
      ...vt.clear(this.area.y0, this.area.x0, this.area.h, this.area.w),
    );

    if (this.#options.length === 0) {
      this.#render_empty();
    } else {
      this.#render_options();
    }

    this.#editor.render();

    vt.esu();
  }

  #filter(): void {
    const text = this.#editor.buffer.get_text().toUpperCase();

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

    let area_height = 3 + Math.max(this.#list_size, 1);
    if (area_height > this.#parent_area.h) {
      area_height = this.#parent_area.h;
      if (this.#list_size > 0) {
        this.#list_size = area_height - 3;
      }
    }
    const area_width = Math.min(60, this.#parent_area.w);

    const x0 = Math.trunc((this.#parent_area.w - area_width) / 2);
    const y0 = Math.trunc((this.#parent_area.h - area_height) / 2);

    this.area = new Area(x0, y0, area_width, area_height);

    this.#editor.resize(new Area(x0 + 2, y0 + 1, area_width - 4, 1));
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
      vt.cursor.set(this.area.y0 + 2, this.area.x0 + 2),
      theme.OPTION,
      ...vt.fmt.text({ len: this.area.w - 4 }, "No matching commands"),
    );
  }

  #render_options(): void {
    let i = 0;
    let y = this.area.y0 + 2;

    while (true) {
      if (i === this.#list_size) {
        break;
      }
      const index = this.#scroll_index + i;
      const option = this.#options[index];
      if (!option) {
        break;
      }
      if (y === this.area.y1) {
        break;
      }

      const space = { len: this.area.w - 4 };

      vt.write_buf(
        index === this.#selected_index ? theme.SELECTED_OPTION : theme.OPTION,
        vt.cursor.set(y, this.area.x0 + 2),
        ...vt.fmt.text(space, option.description),
      );

      vt.write_buf(
        ...vt.fmt.text(space, option.shortcuts.padStart(space.len)),
      );

      i += 1;
      y += 1;
    }
  }
}
