import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { SaveWidget } from "./widget.ts";

export class SavePlugin extends plugins.Plugin {
  readonly widget = new SaveWidget();

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }
}
