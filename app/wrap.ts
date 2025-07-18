import { Action } from "./action.ts";

export class WrapAction extends Action<[]> {
  run(): void {
    this.app.editor.toggle_wrap();
    this.app.footer.set_wrap_status(this.app.editor.wrap_enabled);

    this.app.resize();
  }
}
