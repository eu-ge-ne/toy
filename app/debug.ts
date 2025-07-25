import { Action } from "./action.ts";

export class DebugAction extends Action {
  protected override async _run(): Promise<void> {
    const { debug } = this.app;

    debug.enabled = !debug.enabled;
  }
}
