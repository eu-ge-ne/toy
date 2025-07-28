import { display_keys } from "@lib/input";
import { Area } from "@lib/ui";

import { Command } from "./command.ts";

export class ZenCommand extends Command {
  match_keys = [
    { name: "F11" },
  ];

  option = {
    id: "Zen",
    description: "Global: Toggle Zen Mode",
    shortcuts: display_keys(this.match_keys),
  };

  async command(): Promise<void> {
    const { header, footer, editor } = this.app.ui;

    this.app.zen = !this.app.zen;

    header.enabled = !this.app.zen;
    footer.enabled = !this.app.zen;
    editor.line_index_enabled = !this.app.zen;

    this.app.resize(Area.from_screen());
    this.app.render();
  }
}
