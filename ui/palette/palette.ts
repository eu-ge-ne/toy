import { GraphemePool } from "@lib/grapheme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { PALETTE_BG, PALETTE_COLORS } from "@ui/theme";

export class Palette extends Modal<[], void> {
  protected size = new Area(0, 0, 60, 10);

  readonly editor = new Editor(new GraphemePool(), { multi_line: false });
  #text = "";
  #done!: PromiseWithResolvers<void>;

  async open(): Promise<void> {
    this.enabled = true;
    this.#text = "TODO";
    this.#done = Promise.withResolvers();

    this.render();

    await this.#done.promise;

    this.enabled = false;
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

    let pos = 0;

    for (let y = y0 + 3; y < y1; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const space = { len: w - 4 };
      const line = this.#text.slice(pos, pos + space.len);

      pos += line.length;

      vt.write(
        vt.cursor.set(y, x0 + 2),
        PALETTE_COLORS,
        ...vt.fmt.text(space, line),
      );
    }

    this.editor.render();
  }
}
