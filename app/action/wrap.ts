import { Action } from "./action.ts";

export class WrapAction extends Action {
  keys = [
    { name: "F6" },
  ];

  protected override async action(): Promise<void> {
    if (Action.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.wrap_enabled = !editor.wrap_enabled;
    editor.cursor.move(0, -Number.MAX_SAFE_INTEGER, false);

    editor.render();
  }
}
