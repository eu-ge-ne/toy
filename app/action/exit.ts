import { Action } from "./action.ts";

export class ExitAction extends Action {
  keys = [
    { name: "F10" },
  ];

  protected override async action(): Promise<void> {
    if (Action.started > 1) {
      return;
    }

    const { changes, ui } = this.app;

    ui.editor.enabled = false;

    if (changes) {
      if (await ui.ask.open("Save changes?")) {
        await this.app.save();
      }
    }

    this.app.stop();
  }
}
