import { Action } from "./action.ts";

export class DeleteAction extends Action {
  keys = [
    { name: "DELETE" },
  ];

  protected override async action(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (editor.cursor.selecting) {
      editor.delete_selection();
    } else {
      editor.delete_char();
    }

    editor.render();
  }
}
