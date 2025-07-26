import { GraphemePool } from "@lib/grapheme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { PALETTE_BG, PALETTE_COLORS, PALETTE_SELECTED_COLORS } from "@ui/theme";

const MAX_LIST_SIZE = 10;

export interface PaletteOption {
  name: string;
}

export class Palette
  extends Modal<[PaletteOption[]], PaletteOption | undefined> {
  protected size = new Area(0, 0, 0, 0);

  readonly editor = new Editor(new GraphemePool(), { multi_line: false });
  #done!: PromiseWithResolvers<void>;
  #parent_area!: Area;
  #options: PaletteOption[] = [];
  #filtered: PaletteOption[] = [];
  #selected_index = 0;
  #scroll_index = 0;

  async open(options: PaletteOption[]): Promise<PaletteOption | undefined> {
    this.enabled = true;
    this.editor.enabled = true;

    this.#options = options;
    this.#done = Promise.withResolvers();

    this.editor.history.on_changed = () => {
      this.#filter();
      this.render();
    };
    this.#filter();
    this.render();

    await this.#done.promise;

    this.enabled = false;
    this.editor.enabled = false;
    this.editor.history.on_changed = undefined;

    return;
  }

  on_esc_key(): void {
    this.#done.resolve();
  }

  on_enter_key(): void {
    this.#done.resolve();
  }

  on_up_key(): void {
    if (this.#filtered.length === 0) {
      return;
    }

    this.#selected_index = Math.max(this.#selected_index - 1, 0);
  }

  on_down_key(): void {
    if (this.#filtered.length === 0) {
      return;
    }

    this.#selected_index = Math.min(
      this.#selected_index + 1,
      this.#filtered.length - 1,
    );
  }

  override resize(area: Area): void {
    this.#parent_area = area;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const list_size = Math.min(this.#filtered.length, MAX_LIST_SIZE);
    this.size = new Area(0, 0, 60, 3 + list_size);
    super.resize(this.#parent_area);
    this.editor.resize(
      new Area(this.area.x0 + 2, this.area.y0 + 1, this.area.w - 4, 1),
    );
    this.parent.render();

    const delta = this.#selected_index - this.#scroll_index;
    if (delta < 0) {
      this.#scroll_index = this.#selected_index;
    } else if (delta >= list_size) {
      this.#scroll_index = this.#selected_index - list_size + 1;
    }

    vt.write(
      vt.bsu,
      vt.cursor.hide,
      PALETTE_BG,
      ...vt.clear(this.area.y0, this.area.x0, this.area.h, this.area.w),
    );

    const max_i = this.#scroll_index + list_size;
    let i = this.#scroll_index;

    for (let y = this.area.y0 + 2; y < this.area.y1; y += 1) {
      if (i === max_i) {
        break;
      }
      const option = this.#filtered[i];
      if (!option) {
        break;
      }

      const space = { len: this.area.w - 4 };

      vt.write(
        vt.cursor.set(y, this.area.x0 + 2),
        i === this.#selected_index ? PALETTE_SELECTED_COLORS : PALETTE_COLORS,
        ...vt.fmt.text(space, option.name),
      );

      vt.write(vt.fmt.space(space, space.len));

      i += 1;
    }

    this.editor.render();
  }

  #filter(): void {
    const text = this.editor.buffer.get_text();

    if (!text) {
      this.#filtered = this.#options;
    } else {
      this.#filtered = this.#options.filter((x) =>
        x.name.toUpperCase().includes(text.toUpperCase())
      );
    }

    this.#filtered.sort((a, b) => a.name.localeCompare(b.name));

    this.#selected_index = 0;
  }
}
