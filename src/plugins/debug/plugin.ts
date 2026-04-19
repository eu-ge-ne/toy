import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import { DebugWidget } from "./widget.ts";

export class DebugPlugin extends plugins.Plugin {
  readonly widget = new DebugWidget({
    disabled: true,
    renderTime: 0,
    inputTime: 0,
  });

  override async handleCommand(cmd: commands.Command): Promise<boolean> {
    if (cmd.name === "Debug") {
      this.widget.props.disabled = !this.widget.props.disabled;
      return true;
    }

    return false;
  }
}
