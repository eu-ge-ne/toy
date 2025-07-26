import { GraphemePool } from "@lib/grapheme";
//import { Key } from "@lib/input";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { SAVE_AS_BG, SAVE_AS_COLORS } from "@ui/theme";

export class SaveAs extends Modal<[string], string> {
  protected size = new Area(0, 0, 60, 10);

  readonly editor = new Editor(new GraphemePool(), { multi_line: false });
  #done!: PromiseWithResolvers<string>;

  async open(file_path: string): Promise<string> {
    const { buffer } = this.editor;

    this.enabled = true;
    this.editor.enabled = true;
    this.#done = Promise.withResolvers();

    buffer.set_text(file_path);
    this.editor.reset(true);

    this.render();

    const result = await this.#done.promise;

    this.enabled = false;
    this.editor.enabled = false;

    return result;
  }

  on_esc_key(): void {
    this.#done.resolve("");
  }

  on_enter_key(): void {
    const path = this.editor.buffer.get_text();
    if (path.length > 0) {
      this.#done.resolve(path);
      return;
    }

    //this.#editor.on_key(key);
  }

  override resize(area: Area): void {
    super.resize(area);

    this.editor.resize(
      new Area(this.area.x0 + 2, this.area.y0 + 4, this.area.w - 4, 1),
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
      SAVE_AS_BG,
      ...vt.clear(y0, x0, h, w),
      vt.cursor.set(y0 + 1, x0),
      SAVE_AS_COLORS,
      ...vt.fmt.center({ len: w }, "Save As"),
      vt.cursor.set(y1 - 2, x0),
      ...vt.fmt.center({ len: w }, "ESC‧cancel    ENTER‧ok"),
      vt.esu,
    );

    this.editor.render();
  }
}
