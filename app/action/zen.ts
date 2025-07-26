import { Action } from "./action.ts";

export class ZenAction extends Action {
  keys = [
    { name: "F11" },
  ];

  protected override async action(): Promise<void> {
    if (Action.started > 1) {
      return;
    }

    const { header, footer, editor } = this.app.ui;

    this.app.zen = !this.app.zen;

    header.enabled = !this.app.zen;
    footer.enabled = !this.app.zen;
    editor.line_index_enabled = !this.app.zen;

    this.app.resize();
    this.app.render();
  }
}
