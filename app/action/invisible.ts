import { Key } from "@lib/input";

import { Action } from "./action.ts";

export class InvisibleAction extends Action {
  match(key: Key | string): boolean {
    return typeof key !== "string" && key.name === "F5";
  }

  protected override async _run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.invisible_enabled = !editor.invisible_enabled;
    editor.render();
  }
}
