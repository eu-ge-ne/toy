import { Action } from "./action.ts";

export class InvisibleAction extends Action {
  keys = [
    { name: "F5" },
  ];

  protected override async action(): Promise<void> {
    if (Action.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.invisible_enabled = !editor.invisible_enabled;

    editor.render();
  }
}
