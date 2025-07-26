import { Action } from "./action.ts";

export class SelectAllAction extends Action {
  keys = [
    { name: "a", ctrl: true },
    { name: "a", super: true },
  ];

  protected override async action(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const { cursor } = editor;

    cursor.move(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, false);
    cursor.move(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true);

    editor.render();
  }
}
