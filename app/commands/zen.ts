import { Command } from "./command.ts";

export class ZenCommand extends Command {
  keys = [
    { name: "F11" },
  ];

  protected override async command(): Promise<void> {
    if (Command.started > 1) {
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
