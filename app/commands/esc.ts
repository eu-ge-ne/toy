import { Command } from "./command.ts";

export class EscCommand extends Command {
  keys = [
    { name: "ESC" },
  ];

  async command(): Promise<void> {
    const { palette, alert, ask, save_as, editor } = this.app.ui;

    if (alert.enabled) {
      alert.on_esc_key();
      alert.render();
      return;
    }

    if (ask.enabled) {
      ask.on_esc_key();
      ask.render();
      return;
    }

    if (save_as.enabled) {
      save_as.on_esc_key();
      save_as.render();
      return;
    }

    if (palette.enabled) {
      palette.on_esc_key();
      palette.render();
      return;
    }

    if (editor.enabled && editor.opts.multi_line) {
      editor.view.center();
      editor.render();
    }
  }
}
