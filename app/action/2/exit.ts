import { Action } from "../action.ts";
import { SaveAction } from "./save.ts";

export class ExitAction extends Action {
  keys = [
    { name: "F10" },
  ];

  protected override async _run(): Promise<void> {
    const { changes, ui } = this.app;

    if (changes) {
      if (await ui.ask.open("Save changes?")) {
        await new SaveAction(this.app).run();
      }
    }

    this.app.stop();
  }
}
