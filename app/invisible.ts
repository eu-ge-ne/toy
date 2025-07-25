import { Action } from "./action.ts";

export class InvisibleAction extends Action {
  protected override async _run(): Promise<void> {
    this.app.ui.editor.toggle_invisible();
  }
}
