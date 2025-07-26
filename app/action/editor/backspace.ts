import { Action } from "../action.ts";

export class BackspaceAction extends Action {
  keys = [
    { name: "BACKSPACE" },
  ];

  protected override async _run(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (editor.cursor.selecting) {
      editor.delete_selection();
    } else {
      editor.backspace();
    }

    editor.render();
  }
}
