import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { EditorWidget } from "@widgets/editor";
import { ListWidget } from "@widgets/list";

import { options } from "./options.ts";

const maxListSize = 10;

interface PaletteWidgetProps {
  onRender: () => void;
}

export class PaletteWidget
  extends widgets.Modal<[], commands.Command | undefined> {
  protected override children: {
    bg: BgWidget;
    editor: EditorWidget;
    list: ListWidget<commands.Command>;
  };

  constructor(readonly props: PaletteWidgetProps) {
    super();

    this.children = {
      bg: new BgWidget(),
      editor: new EditorWidget({ multiLine: false }),
      list: new ListWidget<commands.Command>({
        emptyText: "No matching commands",
      }),
    };
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

  protected override async openBefore(): Promise<void> {
    const { editor, list } = this.children;

    editor.setFocused(true);
    editor.text = "";
    editor.resetChanges();
    editor.resetCursor();

    list.values = options;
  }

  protected override render(): void {
    this.props.onRender();

    super.render();
  }

  protected override async handleKey(
    key: kitty.Key,
  ): Promise<[] | [commands.Command | undefined]> {
    const { list, editor } = this.children;

    switch (key.name) {
      case "ESC":
        return [undefined];
      case "ENTER":
        return [list.values[list.selectedIndex]?.value];
      case "UP":
        if (list.values.length > 0) {
          list.selectedIndex = Math.max(list.selectedIndex - 1, 0);
        }
        return [];
      case "DOWN":
        if (list.values.length > 0) {
          list.selectedIndex = Math.min(
            list.selectedIndex + 1,
            list.values.length - 1,
          );
        }
        return [];
    }

    editor.onKey(key);
    this.#filter();

    return [];
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

  #filter(): void {
    const { editor, list } = this.children;

    list.selectedIndex = 0;

    const text = editor.text.toUpperCase();

    if (!text) {
      list.values = options;
    } else {
      list.values = options.filter((x) => x.name.toUpperCase().includes(text));
    }
  }
}
