import { Action } from "./action.ts";

export class PasteAction extends Action {
  keys = [
    { name: "v", ctrl: true },
    { name: "v", super: true },
  ];

  protected override async action(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (!editor.clipboard) {
      return;
    }

    editor.insert(editor.clipboard);

    editor.render();
  }
}
