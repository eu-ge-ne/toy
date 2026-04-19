import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

export class CommandsPlugin extends plugins.Plugin {
  override async handleKey(key: kitty.Key): Promise<boolean> {
    const name = commands.ShortcutToCommand[kitty.shortcut(key)];
    if (!name) {
      return false;
    }

    await this.host.handleCommand({ name } as commands.Command);

    return true;
  }

  override async handleCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        await this.host.handleZen();
        return true;

      case "Exit":
        await this.host.handleExit();
        return true;

      case "Palette":
        await this.host.handlePalette();
        return true;

      case "Save":
        await this.host.handleSave();
        return true;

      case "Theme":
        await this.host.handleTheme(themes.Themes[cmd.data]);
        return false;

      case "Whitespace":
        await this.host.handleWhitespace();
        return true;

      case "Wrap":
        await this.host.handleWrap();
        return true;

      case "Copy":
        await this.host.handleCopy();
        return true;

      case "Cut":
        await this.host.handleCut();
        return true;

      case "Paste":
        await this.host.handlePaste();
        return true;

      case "Undo":
        await this.host.handleUndo();
        return true;

      case "Redo":
        await this.host.handleRedo();
        return true;

      case "SelectAll":
        await this.host.handleSelectAll();
        return true;
    }

    return false;
  }
}
