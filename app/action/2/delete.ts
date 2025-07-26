import { Action } from "../action.ts";

export class DeleteAction extends Action {
  keys = [
    { name: "DELETE" },
  ];

  protected override async _run(): Promise<void> {
    const { save_as, editor } = this.app.ui;

    if (save_as.enabled) {
      if (save_as.editor.cursor.selecting) {
        save_as.editor.delete_selection();
      } else {
        save_as.editor.delete_char();
      }
      save_as.editor.render();
      return;
    }

    if (editor.enabled) {
      if (editor.cursor.selecting) {
        editor.delete_selection();
      } else {
        editor.delete_char();
      }
      editor.render();
    }
  }
}
