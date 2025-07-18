import { Action } from "./action.ts";

export class DebugAction extends Action<[]> {
  run(): void {
    this.app.debug.enabled = !this.app.debug.enabled;
  }
}
