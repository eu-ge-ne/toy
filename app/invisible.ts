import { Action } from "./action.ts";

export class InvisibleAction extends Action<[]> {
  run(): void {
    this.app.editor.toggle_invisible();
    this.app.footer.set_invisible_status(this.app.editor.invisible_enabled);
  }
}
