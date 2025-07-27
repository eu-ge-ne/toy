import { GraphemePool } from "@lib/grapheme";
import { display_key, Key } from "@lib/input";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { PALETTE_BG, PALETTE_COLORS, PALETTE_SELECTED_COLORS } from "@ui/theme";

const MAX_LIST_SIZE = 10;

export interface PaletteOption {
  option: { name: string; description: string };
  keys: Key[];
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
        x.option.name.toUpperCase().includes(text) ||
        x.option.description.toUpperCase().includes(text)
      );
    }

    this.#selected_index = 0;
  }

  #resize(): void {
    //this.#list_size = Math.min(this.#options.length, MAX_LIST_SIZE);
    const area_width = Math.min(60, this.#parent_area.w);
    //const max_height = this.#parent_area.h;
    //const area_height = Math.min(this.size.h, this.#parent_area.h);
    let area_height = 3;

    this.#list_size = 0;
    for (const option of this.#options) {
      if (this.#list_size === MAX_LIST_SIZE) {
        break;
      }
      const h = 1 + Math.ceil((option.option.description.length + 8) / 56);
      if (area_height + h > this.#parent_area.h) {
        break;
      }
      area_height += h;
      this.#list_size += 1;
    }

    //this.size = new Area(0, 0, 60, 3 + Math.max(this.#list_size, 1));
    //this.size = new Area(0, 0, area_width, area_height);
    //this.area = this.#parent_area.center(this.size);
    const x0 = Math.trunc((this.#parent_area.w - area_width) / 2);
    const y0 = Math.trunc((this.#parent_area.h - area_height) / 2);
    this.area = new Area(x0, y0, area_width, area_height);

    this.editor.resize(
      new Area(this.area.x0 + 2, this.area.y0 + 1, this.area.w - 4, 1),
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
    const max_i = this.#scroll_index + this.#list_size;
    let i = this.#scroll_index;

    for (let y = this.area.y0 + 2; y < this.area.y1; y += 1) {
      if (i === max_i) {
        break;
      }
      const option = this.#options[i];
      if (!option) {
        break;
      }

      const space = { len: this.area.w - 4 };

      vt.write(
        vt.cursor.set(y, this.area.x0 + 2),
        i === this.#selected_index ? PALETTE_SELECTED_COLORS : PALETTE_COLORS,
        ...vt.fmt.text(space, option.option.name),
      );

      const keys = option.keys.map(display_key).join(", ").padStart(space.len);

      vt.write(...vt.fmt.text(space, keys));

      i += 1;
    }
  }
}
