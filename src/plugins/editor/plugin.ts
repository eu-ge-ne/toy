import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

export class EditorPlugin extends plugins.Plugin {
  readonly widget = new EditorWidget({
    multiLine: true,
    onCursorChange: (x) => this.host.emitCursorChange(x),
    onKeyHandle: (x) => this.host.emitKeyHandled(x),
  });

  override onStart(): void {
    this.widget.setFocused(true);
    this.widget.resetChanges();
    this.widget.resetCursor();
  }

  override onRender(): void {
    this.widget.render();
  }

  override async onKey(key: kitty.Key): Promise<boolean> {
    if (commands.ShortcutToCommand[kitty.shortcut(key)]) {
      return false;
    }

    return this.widget.onKey(key);
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.widget.toggleIndex();
        return false;

      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;

      case "Whitespace":
        this.widget.toggleWhitespace();
        return true;

      case "Wrap":
        this.widget.toggleWrapped();
        return true;

      case "Copy":
        this.widget.copy();
        return true;

      case "Cut":
        this.widget.cut();
        return true;

      case "Paste":
        this.widget.paste();
        return true;

      case "Undo":
        this.widget.undo();
        return true;

      case "Redo":
        this.widget.redo();
        return true;

      case "SelectAll":
        this.widget.selectAll();
        return true;
    }

    return false;
  }
}
