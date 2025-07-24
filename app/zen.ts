import { Action } from "./action.ts";

export class ZenAction extends Action {
  protected override async _run(): Promise<void> {
    this.app.toggle_zen();

    this.app.resize();
  }
}
