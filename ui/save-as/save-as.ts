import { InputReader, new_input_reader } from "@lib/input";
import { GraphemePool } from "@lib/grapheme";
import { Area, Modal } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";
import { SAVE_AS_BG, SAVE_AS_COLORS } from "@ui/theme";

export class SaveAs extends Modal<[string], string> {
  protected size = new Area(0, 0, 40, 10);

  #editor = new Editor(new GraphemePool(), { multi_line: false });

  async open(file_path: string): Promise<string> {
    let input: InputReader | undefined;

    try {
      this.enabled = true;
      this.#editor.enabled = true;

      this.#editor.buffer.set_text(file_path);
      this.#editor.reset(true);

      this.render();

      const { promise, resolve } = Promise.withResolvers<string>();

      input = new_input_reader((key) => {
        if (typeof key !== "string") {
          switch (key.name) {
            case "ESC":
              resolve("");
              return;
            case "ENTER": {
              const new_file_path = this.#editor.buffer.get_text();
              if (new_file_path.length > 0) {
                resolve(new_file_path);
                return;
              }
              break;
            }
          }
        }

        this.#editor.on_key(key);

        this.render();
      });

      return await promise;
    } finally {
      input?.releaseLock();

      this.enabled = false;
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
      ...vt.fmt.center({ len: w }, "ESC [cancel]    ENTER [ok]"),
      vt.esu,
    );

    this.#editor.render();
  }
}
