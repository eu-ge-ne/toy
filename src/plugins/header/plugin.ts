import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export class HeaderPlugin extends plugins.Plugin {
  #disabled = true;

  readonly #widget = new HeaderWidget({
    fileName: "",
    modified: false,
  });

  override onResize(): void {
    const { columns } = Deno.consoleSize();

    this.#widget.resize(columns, 1, 0, 0);
  }

  override onRender(): void {
    if (this.#disabled) {
      return;
    }
    this.#widget.render();
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#disabled = !this.#disabled;
        this.host.resize();
        return false;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }

  override async onDocNameChange(docName: string): Promise<void> {
    this.#widget.props.fileName = docName;
  }

  override async onDocChange(): Promise<void> {
    this.#widget.props.modified = true;
  }

  override async onDocReset(): Promise<void> {
    this.#widget.props.modified = false;
  }
}
