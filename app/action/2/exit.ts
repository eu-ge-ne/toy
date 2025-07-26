import { Action } from "../action.ts";

export class ExitAction extends Action {
  keys = [
    { name: "F10" },
  ];

  protected override async _run(): Promise<void> {
    const { changes, ui, save_action } = this.app;

    if (!ui.editor.enabled) {
      return;
    }

    if (changes) {
      ui.editor.enabled = false;

      if (await ui.ask.open("Save changes?")) {
        await save_action.run();
      }
    }

    this.app.stop();
  }
}
