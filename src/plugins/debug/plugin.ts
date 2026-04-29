import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

export class DebugPlugin extends plugins.Plugin {
  #zen = true;

  readonly #widget = new DebugWidget({
    disabled: true,
    renderTime: 0,
    inputTime: 0,
  });

  override onResize(): void {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(30, 0, columns);
    const h = std.clamp(7, 0, rows);
    const y = this.#zen ? rows - h : rows - 1 - h;
    const x = columns - w;

    this.#widget.resize(w, h, y, x);
  }

  override renderOrder(): number {
    return 1000;
  }

  override onRender(): void {
    this.#widget.render();
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#zen = !this.#zen;
        this.host.emitResize();
        return false;

      case "Debug":
        this.#widget.props.disabled = !this.#widget.props.disabled;
        return true;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }

  override onDebug(data: plugins.DebugData): void {
    if (typeof data.renderElapsed === "number") {
      this.#widget.props.renderTime = data.renderElapsed;
    }

    if (typeof data.keyElapsed === "number") {
      this.#widget.props.inputTime = data.keyElapsed;
    }
  }
}
