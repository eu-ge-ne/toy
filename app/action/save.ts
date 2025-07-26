import { Action } from "./action.ts";

export class SaveAction extends Action {
  keys = [
    { name: "F2" },
  ];

  protected override async _run(): Promise<void> {
    if (Action.started > 1) {
      return;
    }

    const { editor } = this.app.ui;

    editor.enabled = false;

    await this.app.save();

    editor.enabled = true;
    editor.reset(false);
    editor.render();
  }
}
