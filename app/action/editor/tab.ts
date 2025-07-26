import { Action } from "../action.ts";

export class TabAction extends Action {
  keys = [
    { name: "TAB" },
  ];

  protected override async _run(): Promise<void> {
    const editor = this.app.focused_editor;
    if (!editor?.enabled) {
      return;
    }

    if (editor.opts.multi_line) {
      editor.insert("\t");

      editor.render();
    }
  }
}
