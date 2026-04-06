import { Editor } from "@app/editor";
import { Command } from "@lib/commands";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { availableOptions } from "./options.ts";

const maxListSize = 10;

interface PaletteEvents {
  layoutChange: unknown;
  render: unknown;
}

export class Palette extends ui.Component<PaletteEvents> {
  #enabled = false;

  protected override children: {
    bg: ui.Bg;
    editor: Editor;
    list: ui.List<Command>;
  };

  constructor() {
    super();

    this.children = {
      bg: new ui.Bg(new Uint8Array()),
      editor: new Editor({
        disabled: false,
        index: false,
        multiLine: false,
        whitespace: false,
        wrap: false,
      }),
      list: new ui.List<Command>(
        "No matching commands",
        new Uint8Array(),
        new Uint8Array(),
      ),
    };

    this.children.list.values = availableOptions;
  }

  async run(): Promise<Command | undefined> {
    this.#enabled = true;
    this.children.editor.enable(true);

    this.children.editor.textBuf.reset();
    this.children.editor.reset(false);

    this.#filter();

    this.emit("render", undefined);

    const cmd = await this.#processInput();

    this.#enabled = false;
    this.children.editor.enable(false);

    return cmd;
  }

  override resizeChildren(): void {
    const width = Math.min(60, this.width);

    let listSize = Math.min(this.children.list.values.length, maxListSize);
    let height = 3 + Math.max(listSize, 1);
    if (height > this.height) {
      height = this.height;
      if (listSize > 0) {
        listSize = height - 3;
      }
    }

    const y = this.y + Math.trunc((this.height - height) / 2);
    const x = this.x + Math.trunc((this.width - width) / 2);

    this.children.bg.resize(width, height, y, x);
    this.children.editor.resize(width - 4, 1, y + 1, x + 2);
    this.children.list.resize(width - 4, height - 3, y + 2, x + 2);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.bg.render();
    this.children.editor.render();
    this.children.list.render();
  }

  setTheme(theme: themes.Theme): void {
    const bg = theme.bg_light1;
    const option = new Uint8Array([...theme.bg_light1, ...theme.fg_light1]);
    const selectedOption = new Uint8Array([
      ...theme.bg_light2,
      ...theme.fg_light1,
    ]);

    this.children.bg.color = bg;
    this.children.list.color = option;
    this.children.list.selectedColor = selectedOption;
  }

  async #processInput(): Promise<Command | undefined> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return;
        case "ENTER":
          return this.children.list.values[this.children.list.selectedIndex]
            ?.value;
        case "UP":
          if (this.children.list.values.length > 0) {
            this.children.list.selectedIndex = Math.max(
              this.children.list.selectedIndex - 1,
              0,
            );
            this.emit("render", undefined);
          }
          continue;
        case "DOWN":
          if (this.children.list.values.length > 0) {
            this.children.list.selectedIndex = Math.min(
              this.children.list.selectedIndex + 1,
              this.children.list.values.length - 1,
            );
            this.emit("render", undefined);
          }
          continue;
      }

      this.children.editor.handleKey(key);
      this.#filter();
      this.emit("render", undefined);
    }
  }

  #filter(): void {
    const text = this.children.editor.textBuf.text().toUpperCase();

    if (!text) {
      this.children.list.values = availableOptions;
    } else {
      this.children.list.values = availableOptions.filter((x) =>
        x.name.toUpperCase().includes(text)
      );
    }

    this.children.list.selectedIndex = 0;

    this.emit("layoutChange", undefined);
  }
}
