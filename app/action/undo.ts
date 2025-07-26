import { Action } from "./action.ts";

export class UndoAction extends Action {
  keys = [
    { name: "z", ctrl: true },
    { name: "z", super: true },
  ];

  protected override async action(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.undo();

    editor.render();
  }
}
