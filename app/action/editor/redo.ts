import { Action } from "../action.ts";

export class RedoAction extends Action {
  keys = [
    { name: "y", ctrl: true },
    { name: "y", super: true },
  ];

  protected override async action(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    editor.history.redo();

    editor.render();
  }
}
