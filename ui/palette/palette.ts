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
  protected size = new Area(0, 0, 60, 10);

  readonly editor = new Editor(new GraphemePool(), { multi_line: false });
  #options: PaletteOption[] = [];
  #filtered: PaletteOption[] = [];
  #done!: PromiseWithResolvers<void>;

  async open(options: PaletteOption[]): Promise<PaletteOption | undefined> {
    this.enabled = true;
    this.editor.enabled = true;

    this.#options = options;
    this.#done = Promise.withResolvers();

    this.#filter();
    this.render();

    await this.#done.promise;

    this.enabled = false;
    this.editor.enabled = false;

    return;
  }

  on_esc_key(): void {
    this.#done.resolve();
  }

  on_enter_key(): void {
    this.#done.resolve();
  }

  override resize(area: Area): void {
    super.resize(area);

    this.editor.resize(
      new Area(this.area.x0 + 2, this.area.y0 + 1, this.area.w - 4, 1),
    );
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, y1, h, w } = this.area;

    vt.write(
      vt.bsu,
      vt.cursor.hide,
      PALETTE_BG,
      ...vt.clear(y0, x0, h, w),
    );

    let i = 0;

    for (let y = y0 + 3; y < y1; y += 1) {
      if (i === this.#options.length) {
        break;
      }

      const space = { len: w - 4 };
      const option = this.#filtered[i]!;

      vt.write(
        vt.cursor.set(y, x0 + 2),
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
      this.#filtered = this.#options.filter((x) => x.name.includes(text));
    }

    this.#filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
}
