import { Action } from "../action.ts";

export class DebugAction extends Action {
  keys = [
    { name: "F9" },
  ];

  protected override async _run(): Promise<void> {
    const { debug, editor } = this.app.ui;

    if (!editor.enabled) {
      return;
    }

    debug.enabled = !debug.enabled;

    editor.render();
  }
}
