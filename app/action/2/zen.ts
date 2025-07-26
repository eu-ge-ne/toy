import { Action } from "../action.ts";

export class ZenAction extends Action {
  keys = [
    { name: "F11" },
  ];

  protected override async _run(): Promise<void> {
    const { header, footer, editor } = this.app.ui;

    if (!editor.enabled) {
      return;
    }

    this.app.zen = !this.app.zen;

    header.enabled = !this.app.zen;
    footer.enabled = !this.app.zen;
    editor.line_index_enabled = !this.app.zen;

    this.app.resize();
    this.app.render();
  }
}
