import { Action } from "./action.ts";
import { SaveAction } from "./2/save.ts";

export class ExitAction extends Action {
  keys = [
    { name: "F10" },
  ];

  protected override async _run(): Promise<void> {
    const { changes, ui, actions_started } = this.app;

    if (actions_started > 1) {
      return;
    }

    if (changes) {
      ui.editor.enabled = false;

      if (await ui.ask.open("Save changes?")) {
        await new SaveAction(this.app).run();
      }
    }

    this.app.stop();
  }
}
