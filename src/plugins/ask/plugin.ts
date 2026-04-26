import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskWidget } from "./widget.ts";

export class AskPlugin extends plugins.Plugin {
  protected name = "Ask";

  readonly #widget = new AskWidget();

  override register(params: plugins.RegisterParams): void {
    params.setAskHandler(this.onAsk.bind(this));
  }

  override onResize(): void {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(60, 0, columns);
    const h = std.clamp(7, 0, rows);
    const y = Math.trunc((rows - h) / 2);
    const x = Math.trunc((columns - w) / 2);

    this.#widget.resize(w, h, y, x);
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }

  async onAsk(message: string): Promise<boolean> {
    return await this.#widget.open(message);
  }
}
