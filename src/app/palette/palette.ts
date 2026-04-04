import { Editor } from "@components/editor";
import { IRoot } from "@components/root";
import { Command } from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";
import { availableOptions, Option } from "./options.ts";

const maxListSize = 10;

export class Palette extends ui.Component {
  #colors = colors(DefaultTheme);
  #editor: Editor;
  #enabled = false;
  #options: Option[] = availableOptions;

  protected override children = {
    background: new ui.Background(this.#colors.background),
    list: new ui.List(
      "No matching commands",
      this.#colors.option,
      this.#colors.selectedOption,
    ),
  };

  constructor(private readonly root: IRoot) {
    super();

    this.#editor = new Editor(root, { multiLine: false });
  }

  async run(): Promise<Command | undefined> {
    this.#enabled = true;
    this.#editor.enable(true);

    this.#editor.textBuf.reset();
    this.#editor.reset(false);

    this.#filter();
    this.root.render();

    const cmd = await this.#processInput();

    this.#enabled = false;
    this.#editor.enable(false);

    return cmd;
  }

  override resizeChildren(): void {
    const width = Math.min(60, this.width);

    let listSize = Math.min(this.#options.length, maxListSize);
    let height = 3 + Math.max(listSize, 1);
    if (height > this.height) {
      height = this.height;
      if (listSize > 0) {
        listSize = height - 3;
      }
    }

    const y = this.y + Math.trunc((this.height - height) / 2);
    const x = this.x + Math.trunc((this.width - width) / 2);

    this.children.background.resize(width, height, y, x);
    this.#editor.resize(width - 4, 1, y + 1, x + 2);
    this.children.list.resize(width - 4, height - 3, y + 2, x + 2);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.background.render();
    this.#editor.render();
    this.children.list.render();
  }

  override async handleCommand(cmd: Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);

        this.children.background.color = this.#colors.background;
        this.children.list.color = this.#colors.option;
        this.children.list.selectedColor = this.#colors.selectedOption;

        break;
    }
  }

  async #processInput(): Promise<Command | undefined> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return;
        case "ENTER":
          return this.#options[this.children.list.selectedIndex]?.command;
        case "UP":
          if (this.#options.length > 0) {
            this.children.list.selectedIndex = Math.max(
              this.children.list.selectedIndex - 1,
              0,
            );
            this.root.render();
          }
          continue;
        case "DOWN":
          if (this.#options.length > 0) {
            this.children.list.selectedIndex = Math.min(
              this.children.list.selectedIndex + 1,
              this.#options.length - 1,
            );
            this.root.render();
          }
          continue;
      }

      this.#editor.handleKey(key);
      this.#filter();
      this.root.render();
    }
  }

  #filter(): void {
    const text = this.#editor.textBuf.text().toUpperCase();

    if (!text) {
      this.#options = availableOptions;
    } else {
      this.#options = availableOptions.filter((x) =>
        x.name.toUpperCase().includes(text)
      );
    }

    this.children.list.selectedIndex = 0;
    this.children.list.values = this.#options.map((x) => {
      const shortcuts = (x.shortcuts ?? []).join(" ");
      const w = this.width - shortcuts.length;
      const s = x.name.slice(0, w).padEnd(w, " ");
      return s + shortcuts;
    });

    this.root.isLayoutDirty = true;
  }
}
