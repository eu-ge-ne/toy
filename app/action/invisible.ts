import { Action } from "./action.ts";

export class InvisibleAction extends Action {
  protected override async _run(): Promise<void> {
    const { editor } = this.app.ui;

    editor.invisible_enabled = !editor.invisible_enabled;
    editor.render();
  }
}
