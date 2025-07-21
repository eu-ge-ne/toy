import { restore_vt } from "@lib/vt";

import { Action } from "./action.ts";

export function exit(): never {
  restore_vt();

  Deno.exit(0);
}

export class ExitAction extends Action<[], never> {
  async run(): Promise<never> {
    const { unsaved_changes, ask, action } = this.app;

    if (unsaved_changes) {
      if (await ask.open("Save?")) {
        await action.save.run();
      }
    }

    exit();
  }
}
