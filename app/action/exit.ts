import { Action } from "./action.ts";

export class ExitAction extends Action {
  keys = [
    { name: "F10" },
  ];

  protected override async _run(): Promise<void> {
    if (Action.started > 1) {
      return;
    }

    const { changes, ui } = this.app;

    if (changes) {
      ui.editor.enabled = false;

      if (await ui.ask.open("Save changes?")) {
        await this.app.save();
      }
    }

    this.app.stop();
  }
}
