import { Action } from "../action.ts";

export class WrapAction extends Action {
  keys = [
    { name: "F6" },
  ];

  protected override async _run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.wrap_enabled = !editor.wrap_enabled;
    editor.cursor.move(0, -Number.MAX_SAFE_INTEGER, false);
    editor.render();
  }
}
