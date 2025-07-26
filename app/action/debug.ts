import { Action } from "./action.ts";

export class DebugAction extends Action {
  keys = [
    { name: "F9" },
  ];

  protected override async _run(): Promise<void> {
    const { actions_started } = this.app;
    if (actions_started > 1) {
      return;
    }

    const { debug, editor } = this.app.ui;

    debug.enabled = !debug.enabled;

    editor.render();
  }
}
