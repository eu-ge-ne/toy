import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class BackspaceAction extends Action {
  match(key: Key | string): boolean {
    return typeof key !== "string" && key.name === "BACKSPACE";
  }

  protected override async _run(): Promise<void> {
    const { save_as, editor } = this.app.ui;

    if (save_as.enabled) {
      if (save_as.editor.cursor.selecting) {
        save_as.editor.delete_selection();
      } else {
        save_as.editor.backspace();
      }
      save_as.editor.render();
      return;
    }

    if (editor.enabled) {
      if (editor.cursor.selecting) {
        editor.delete_selection();
      } else {
        editor.backspace();
      }
      editor.render();
    }
  }
}
