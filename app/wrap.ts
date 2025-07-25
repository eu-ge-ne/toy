import { Action } from "./action.ts";

export class WrapAction extends Action {
  protected override async _run(): Promise<void> {
    this.app.editor.toggle_wrap();

    this.app.resize();
  }
}
