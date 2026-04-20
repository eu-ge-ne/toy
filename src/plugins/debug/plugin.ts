import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

export class DebugPlugin extends plugins.Plugin {
  readonly widget = new DebugWidget({
    disabled: true,
    renderTime: 0,
    inputTime: 0,
  });

  override onRender(): void {
    this.widget.render();
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Debug":
        this.widget.props.disabled = !this.widget.props.disabled;
        return true;

      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }

  override onKeyHandled(elapsed: number): void {
    this.widget.props.inputTime = elapsed;
  }
}
