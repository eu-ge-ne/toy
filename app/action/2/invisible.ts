import { Action } from "../action.ts";

export class InvisibleAction extends Action {
  keys = [
    { name: "F5" },
  ];

  protected override async _run(): Promise<void> {
    const { editor } = this.app.ui;

    if (!editor.enabled) {
      return;
    }

    editor.invisible_enabled = !editor.invisible_enabled;

    editor.render();
  }
}
