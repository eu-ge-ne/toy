import { GraphemePool } from "@lib/grapheme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { PALETTE_BG, PALETTE_COLORS } from "@ui/theme";

export interface PaletteOption {
  name: string;
}

export class Palette
  extends Modal<[PaletteOption[]], PaletteOption | undefined> {
  protected size = new Area(0, 0, 0, 0);

  readonly editor = new Editor(new GraphemePool(), { multi_line: false });
  #parent_area!: Area;
  #options: PaletteOption[] = [];
  #filtered: PaletteOption[] = [];
  #done!: PromiseWithResolvers<void>;

  async open(options: PaletteOption[]): Promise<PaletteOption | undefined> {
    this.enabled = true;
    this.editor.enabled = true;
    this.editor.history.on_changed = () => {
      this.#filter();
      this.render();
    };

    this.#options = options;
    this.#done = Promise.withResolvers();

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

  override resize(area: Area): void {
    this.#parent_area = area;
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    let h = 3;
    if (this.#filtered.length > 0) {
      h += this.#filtered.length + 1;
    }
    this.size = new Area(0, 0, 60, h);
    super.resize(this.#parent_area);
    this.editor.resize(
      new Area(this.area.x0 + 2, this.area.y0 + 1, this.area.w - 4, 1),
    );
    this.parent.render();

    vt.write(
      vt.bsu,
      vt.cursor.hide,
      PALETTE_BG,
      ...vt.clear(this.area.y0, this.area.x0, this.area.h, this.area.w),
    );

    let i = 0;

    for (let y = this.area.y0 + 3; y < this.area.y1; y += 1) {
      const option = this.#filtered[i];
      if (!option) {
        break;
      }

      const space = { len: this.area.w - 4 };

      vt.write(
        vt.cursor.set(y, this.area.x0 + 2),
        PALETTE_COLORS,
        ...vt.fmt.text(space, option.name),
      );

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
  }
}
