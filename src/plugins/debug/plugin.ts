import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

export class DebugPlugin extends plugins.Plugin {
  #zen = true;

  readonly #widget = new DebugWidget({
    disabled: true,
    version: "",
    renderElapsed: 0,
    inputElapsed: 0,
  });

  constructor(host: plugins.Host) {
    super(host);

    host.on("resize", this.onResize);
    host.on("render", () => this.#widget.render(), 1000);
    host.on("debug.version", this.onDebugVersion);
    host.on("debug.render", this.onDebugRender);
    host.on("debug.input", this.onDebugInput);
  }

  onResize = () => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(30, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = this.#zen ? rows - h : rows - 1 - h;
    const x = columns - w;

    this.#widget.resize(w, h, y, x);
  };

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#zen = !this.#zen;
        this.host.resize();
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

  onDebugVersion = (version: string) => {
    this.#widget.props.version = version;
  };

  onDebugRender = (elapsed: number) => {
    this.#widget.props.renderElapsed = elapsed;
  };

  onDebugInput = (elapsed: number) => {
    this.#widget.props.inputElapsed = elapsed;
  };
}
