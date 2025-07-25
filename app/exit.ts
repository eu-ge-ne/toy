import * as vt from "@lib/vt";

import { Action } from "./action.ts";

export function exit(): never {
  vt.restore();

  Deno.exit(0);
}

export class ExitAction extends Action {
  protected override async _run(): Promise<void> {
    const { unsaved_changes, ui, action } = this.app;

    if (unsaved_changes) {
      if (await ui.ask.open("Save?")) {
        await action.save.run();
      }
    }

    exit();
  }
}
