import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { EditorWidget } from "@widgets/editor";
import { ListWidget } from "@widgets/list";

import { options } from "./options.ts";

const maxListSize = 10;

export class PaletteWidget
  extends widgets.Modal<{ result: commands.Command | undefined }> {
  protected override children: {
    bg: BgWidget;
    editor: EditorWidget;
    list: ListWidget<commands.Command>;
  };

  constructor() {
    super({
      opened: false,
      result: undefined,
    });

    this.children = {
      bg: new BgWidget(),
      list: new ListWidget<commands.Command>({
        emptyText: "No matching commands",
        items: [],
        index: 0,
      }),
      editor: new EditorWidget({ multiLine: false }),
    };
  }

  override resizeChildren(): void {
    const { list, bg, editor } = this.children;

    const width = Math.min(60, this.width);

    let listSize = Math.min(list.props.items.length, maxListSize);
    let height = 3 + Math.max(listSize, 1);
    if (height > this.height) {
      height = this.height;
      if (listSize > 0) {
        listSize = height - 3;
      }
    }

    const y = this.y + Math.trunc((this.height - height) / 2);
    const x = this.x + Math.trunc((this.width - width) / 2);

    bg.resize(width, height, y, x);
    editor.resize(width - 4, 1, y + 1, x + 2);
    list.resize(width - 4, height - 3, y + 2, x + 2);
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgLight1);
    const option = new Uint8Array([...theme.bgLight1, ...theme.fgLight1]);
    const selectedOption = new Uint8Array([
      ...theme.bgLight2,
      ...theme.fgLight1,
    ]);

    this.children.bg.color = bg;
    this.children.list.color = option;
    this.children.list.selectedColor = selectedOption;
    this.children.editor.setTheme(theme);
  }

  open(): void {
    const { editor, list } = this.children;

    editor.setFocused(true);
    editor.text = "";
    editor.resetChanges();
    editor.resetCursor();

    list.props.items = options;

    this.props.opened = true;
  }

  onKeyPress(key: kitty.Key): void {
    const { list, editor } = this.children;

    switch (key.name) {
      case "ESC":
        this.props.result = undefined;
        this.props.opened = false;
        return;
      case "ENTER":
        this.props.result = list.props.items[list.props.index]?.value;
        this.props.opened = false;
        return;
      case "UP":
        if (list.props.items.length > 0) {
          list.props.index = Math.max(list.props.index - 1, 0);
        }
        return;
      case "DOWN":
        if (list.props.items.length > 0) {
          list.props.index = Math.min(
            list.props.index + 1,
            list.props.items.length - 1,
          );
        }
        return;
    }

    editor.onKey(key);

    this.#filter();
  }

  #filter(): void {
    const { editor, list } = this.children;

    list.props.index = 0;

    const text = editor.text.toUpperCase();

    if (!text) {
      list.props.items = options;
    } else {
      list.props.items = options.filter((x) =>
        x.name.toUpperCase().includes(text)
      );
    }
  }
}
