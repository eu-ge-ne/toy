import { Editor } from "@app/editor";
import { Command } from "@lib/commands";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { availableOptions } from "./options.ts";

const maxListSize = 10;

interface PaletteProps {
  onInvalidate: () => void;
}

export class Palette extends ui.Modal<[], Command | undefined> {
  protected override children: {
    bg: ui.Bg;
    editor: Editor;
    list: ui.List<Command>;
  };

  constructor(private readonly props: PaletteProps) {
    super();

    this.children = {
      bg: new ui.Bg(),
      editor: new Editor({ multiLine: false }),
      list: new ui.List<Command>({ emptyText: "No matching commands" }),
    };

    this.children.list.values = availableOptions;
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

  async open(): Promise<Command | undefined> {
    const { list, editor } = this.children;

    editor.setFocused(true);
    editor.text = "";
    editor.reset(false);

    while (true) {
      this.#filter();
      this.props.onInvalidate();
      this.render();

      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return;
        case "ENTER":
          return list.values[list.selectedIndex]?.value;
        case "UP":
          if (list.values.length > 0) {
            list.selectedIndex = Math.max(list.selectedIndex - 1, 0);
          }
          continue;
        case "DOWN":
          if (list.values.length > 0) {
            list.selectedIndex = Math.min(
              list.selectedIndex + 1,
              list.values.length - 1,
            );
          }
          continue;
      }

      editor.onKey(key);
    }
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bg_light1);
    const option = new Uint8Array([...theme.bg_light1, ...theme.fg_light1]);
    const selectedOption = new Uint8Array([
      ...theme.bg_light2,
      ...theme.fg_light1,
    ]);

    this.children.bg.color = bg;
    this.children.list.color = option;
    this.children.list.selectedColor = selectedOption;
    this.children.editor.setTheme(theme);
  }

  #filter(): void {
    const text = this.children.editor.text.toUpperCase();

    if (!text) {
      this.children.list.values = availableOptions;
    } else {
      this.children.list.values = availableOptions.filter((x) =>
        x.name.toUpperCase().includes(text)
      );
    }

    this.children.list.selectedIndex = 0;
  }
}
