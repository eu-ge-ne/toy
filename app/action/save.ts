import { Key } from "@lib/input";

import { Action } from "./action.ts";
import { SaveAsAction } from "./save-as.ts";

export class SaveAction extends Action {
  match(key: Key | string): boolean {
    return typeof key !== "string" && key.name === "F2";
  }

  protected override async _run(): Promise<void> {
    const { file_path, ui } = this.app;

    if (!file_path) {
      await new SaveAsAction(this.app).run();
      return;
    }

    try {
      using file = await Deno.open(file_path, {
        create: true,
        write: true,
        truncate: true,
      });

      await ui.editor.buffer.save(file);

      ui.editor.reset(false);
    } catch (err) {
      await ui.alert.open(err);

      this.app.render();

      await new SaveAsAction(this.app).run();
    }
  }
}
