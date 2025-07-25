import { Action } from "./action.ts";

export class ZenAction extends Action {
  protected override async _run(): Promise<void> {
    this.app.zen = !this.app.zen;

    this.app.header.enabled = !this.app.zen;
    this.app.footer.enabled = !this.app.zen;
    this.app.editor.line_index_enabled = !this.app.zen;

    this.app.resize();
  }
}
