import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class DebugAction extends Action {
  match(key: Key | string): boolean {
    return typeof key !== "string" && key.name === "F9";
  }

  protected override async _run(): Promise<void> {
    const { debug, editor } = this.app.ui;

    debug.enabled = !debug.enabled;
    editor.render();
  }
}
