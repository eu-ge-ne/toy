import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AlertWidget } from "./widget.ts";

export class AlertPlugin {
  readonly #widget = new AlertWidget();

  constructor(host: plugins.Host) {
    host.onReact("resize", this.onResize);
    host.onIntercept("command", this.onCommand);
  }

  onResize = () => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(60, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = Math.trunc((rows - h) / 2);
    const x = Math.trunc((columns - w) / 2);

    this.#widget.resize(w, h, y, x);
  };

  onCommand = async ({ cmd }: { cmd: commands.Command }) => {
    switch (cmd.name) {
      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  };

  async open(message: string): Promise<void> {
    await this.#widget.open(message);
  }
}
