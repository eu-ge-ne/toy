import { GraphemePool } from "@lib/grapheme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { PALETTE_BG, PALETTE_COLORS, PALETTE_SELECTED_COLORS } from "@ui/theme";

const MAX_LIST_SIZE = 10;

export interface PaletteOption {
  name: string;
  description: string;
  keys: string;
}

export class Palette
  extends Modal<[PaletteOption[]], PaletteOption | undefined> {
  protected size = new Area(0, 0, 0, 0);

  readonly editor = new Editor(new GraphemePool(), { multi_line: false });
  #done!: PromiseWithResolvers<PaletteOption | undefined>;
  #parent_area!: Area;

  #all: PaletteOption[] = [];
  #options: PaletteOption[] = [];
  #list_size = 0;
  #selected_index = 0;
  #scroll_index = 0;

  async open(options: PaletteOption[]): Promise<PaletteOption | undefined> {
    this.#done = Promise.withResolvers();

    this.enabled = true;
    this.editor.enabled = true;

    this.#all = options;
    this.editor.buffer.set_text("");
    this.editor.reset(false);
    this.editor.history.on_changed = () => {
      this.#filter();
      this.render();
    };
    this.#filter();
    this.render();

    const result = await this.#done.promise;

    this.enabled = false;
    this.editor.enabled = false;
    this.editor.history.on_changed = undefined;

    return result;
  }

  on_esc_key(): void {
    this.#done.resolve(undefined);
  }

  on_enter_key(): void {
    this.#done.resolve(this.#options[this.#selected_index]);
  }

  on_up_key(): void {
    if (this.#options.length > 0) {
      this.#selected_index = Math.max(this.#selected_index - 1, 0);
    }
  }

  on_down_key(): void {
    if (this.#options.length > 0) {
      this.#selected_index = Math.min(
        this.#selected_index + 1,
        this.#options.length - 1,
      );
    }
  }

  override resize(area: Area): void {
    this.#parent_area = area;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    this.#resize();
    this.parent.render();
    this.#scroll();

    vt.write(
      vt.bsu,
      vt.cursor.hide,
      PALETTE_BG,
      ...vt.clear(this.area.y0, this.area.x0, this.area.h, this.area.w),
    );

    if (this.#options.length === 0) {
      this.#render_empty();
    } else {
      this.#render_options();
    }

    this.editor.render();
  }

  #filter(): void {
    const text = this.editor.buffer.get_text().toUpperCase();

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
    this.#list_size = 0;

    const area_width = Math.min(60, this.#parent_area.w);
    let area_height = 3;

    for (const _ of this.#options) {
      if (this.#list_size === MAX_LIST_SIZE) {
        break;
      }
      //const w = option.description.length;
      //const h = 1 + Math.ceil(w / (area_width - 4));
      const h = 1;
      if (area_height + h > this.#parent_area.h) {
        break;
      }
      area_height += h;
      this.#list_size += 1;
    }

    const x0 = Math.trunc((this.#parent_area.w - area_width) / 2);
    const y0 = Math.trunc((this.#parent_area.h - area_height) / 2);
    this.area = new Area(x0, y0, area_width, area_height);

    this.editor.resize(
      new Area(x0 + 2, y0 + 1, area_width - 4, 1),
    );
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
    vt.write(
      vt.cursor.set(this.area.y0 + 2, this.area.x0 + 2),
      PALETTE_COLORS,
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
      const option = this.#options[this.#scroll_index + i];
      if (!option) {
        break;
      }
      if (y === this.area.y1) {
        break;
      }

      const selected = this.#scroll_index + i === this.#selected_index;

      const space = { len: this.area.w - 4 };
      vt.write(
        selected ? PALETTE_SELECTED_COLORS : PALETTE_COLORS,
        vt.cursor.set(y, this.area.x0 + 2),
        ...vt.fmt.text(space, option.description),
      );
      vt.write(...vt.fmt.text(space, option.keys.padStart(space.len)));

      i += 1;
      y += 1;
    }
  }
}
