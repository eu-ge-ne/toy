import { Action } from "./action.ts";

export class ZenAction extends Action<[]> {
  run(): void {
    this.app.toggle_zen();

    this.app.resize();
  }
}
