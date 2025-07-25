import { Action } from "./action.ts";

export class ExitAction extends Action {
  protected override async _run(): Promise<void> {
    const { changes, ui, action } = this.app;

    if (changes) {
      if (await ui.ask.open("Save changes?")) {
        await action.save.run();
      }
    }

    this.app.stop();
  }
}
