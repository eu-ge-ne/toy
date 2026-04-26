import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AlertWidget } from "./widget.ts";

export class AlertPlugin extends plugins.Plugin {
  protected name = "Alert";

  readonly #widget = new AlertWidget();

  override register(params: plugins.RegisterParams): void {
    params.setAlertHandler(this.onAlert.bind(this));
  }

  override onResize(): void {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(60, 0, columns);
    const h = std.clamp(10, 0, rows);
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

  async onAlert(message: string): Promise<void> {
    await this.#widget.open(message);
  }
}
