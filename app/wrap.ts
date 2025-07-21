import { Action } from "./action.ts";

export class WrapAction extends Action<[]> {
  run(): void {
    this.app.editor.toggle_wrap();
    this.app.resize();
  }
}
