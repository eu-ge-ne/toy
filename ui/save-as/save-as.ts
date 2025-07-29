import { GraphemePool } from "@lib/grapheme";
import { SAVE_AS_BG, SAVE_AS_COLORS } from "@lib/theme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

export class SaveAs extends Modal<[string], string> {
  protected size = new Area(0, 0, 60, 10);

  #editor = new Editor(this, new GraphemePool(), { multi_line: false });

  async open(file_path: string): Promise<string> {
    const { buffer } = this.#editor;

    this.done = Promise.withResolvers();

    this.enabled = true;
    this.#editor.enabled = true;

    buffer.set_text(file_path);
    this.#editor.reset(true);

    this.render();

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
              this.done.resolve("");
              return;
            case "ENTER": {
              const path = this.#editor.buffer.get_text();
              if (path) {
                this.done.resolve(path);
                return;
              }
            }
          }
        }

        if (this.#editor.handle_input(key)) {
          this.#editor.render();
        }
      }
    }
  }

  override resize(area: Area): void {
    super.resize(area);

    this.#editor.resize(
      new Area(this.area.x0 + 2, this.area.y0 + 4, this.area.w - 4, 1),
    );
  }

  render(): void {
    if (!this.enabled) {
      return;
    }

    const { y0, x0, y1, h, w } = this.area;

    vt.bsu();

    vt.write_buf(
      vt.cursor.hide,
      SAVE_AS_BG,
      ...vt.clear(y0, x0, h, w),
      vt.cursor.set(y0 + 1, x0),
      SAVE_AS_COLORS,
      ...vt.fmt.center({ len: w }, "Save As"),
      vt.cursor.set(y1 - 2, x0),
      ...vt.fmt.center({ len: w }, "ESC‧cancel    ENTER‧ok"),
    );

    this.#editor.render();

    vt.esu();
  }
}
