import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class SaveAction extends Action {
  match(key: Key | string): boolean {
    return typeof key !== "string" && key.name === "F2";
  }

  protected override async _run(): Promise<void> {
    const { file_path, ui, save_as_action } = this.app;

    if (!file_path) {
      await save_as_action.run();
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

      await save_as_action.run();
    }
  }
}
