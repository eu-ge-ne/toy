import { GraphemePool } from "@lib/grapheme";
import { read_input } from "@lib/input";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { SAVE_AS_BG, SAVE_AS_COLORS } from "@ui/theme";

export class SaveAs extends Modal<[string], string> {
  protected size = new Area(0, 0, 40, 10);

  #editor = new Editor(new GraphemePool(), {
    multi_line: false,
    show_ln_index: false,
  });

  #opened = false;

  async open(file_path: string): Promise<string> {
    try {
      this.#opened = true;
      this.#editor.enabled = true;

      this.#editor.buf.set_text(file_path);
      this.#editor.reset();

      this.render();

      while (true) {
        for await (const key of read_input()) {
          if (typeof key !== "string") {
            switch (key.name) {
              case "ESC":
                return "";
              case "ENTER": {
                const new_file_path = this.#editor.buf.get_text();
                if (new_file_path.length > 0) {
                  return new_file_path;
                }
                break;
              }
            }
          }

          this.#editor.on_key(key);
        }
      }
    } finally {
      this.#opened = false;
      this.#editor.enabled = false;
    }
  }

  override resize(area: Area): void {
    super.resize(area);

    this.#editor.resize(
      new Area(this.area.x0 + 2, this.area.y0 + 4, this.area.w - 4, 1),
    );
  }

  render(): void {
    if (!this.#opened) {
      return;
    }

    const { y0, x0, y1, h, w } = this.area;

    vt.sync_write(
      vt.cursor.hide,
      SAVE_AS_BG,
      ...vt.clear(y0, x0, h, w),
      vt.cursor.set(y0 + 1, x0),
      SAVE_AS_COLORS,
      ...vt.fmt.center({ len: w }, "Save As"),
      vt.cursor.set(y1 - 2, x0),
      ...vt.fmt.center({ len: w }, "ESC [cancel]    ENTER [ok]"),
    );

    this.#editor.render();
  }
}
