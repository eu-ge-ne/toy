import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskFileNameWidget } from "./widget.ts";

export class AskFileNamePlugin extends plugins.Plugin {
  readonly #widget = new AskFileNameWidget();

  constructor(host: plugins.Host) {
    super(host);

    host.onReact("resize", this.onResize);
  }

  onResize = () => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(60, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = Math.trunc((rows - h) / 2);
    const x = Math.trunc((columns - w) / 2);

    this.#widget.resize(w, h, y, x);
  };

  override async onCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  }

  async open(fileName: string): Promise<string | undefined> {
    return await this.#widget.open(fileName);
  }
}
