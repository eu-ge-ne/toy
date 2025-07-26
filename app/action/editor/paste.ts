import { Action } from "../action.ts";

export class PasteAction extends Action {
  keys = [
    { name: "v", ctrl: true },
    { name: "v", super: true },
  ];

  protected override async _run(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    const { clipboard } = editor;

    if (clipboard.length > 0) {
      editor.insert(clipboard);

      editor.render();
    }
  }
}
