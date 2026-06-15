import * as widgets from "@libs/widgets";

import { BufferAPI } from "@plugins/buffer";
import { CoreAPI } from "@plugins/core";
import { ThemesAPI } from "@plugins/themes";
import { ZenAPI } from "@plugins/zen";

export type ViewAPI = ReturnType<typeof ViewPlugin>;

export function ViewPlugin(...api: ConstructorParameters<typeof View>) {
  return {
    view: new View(...api),
  };
}

class View {
  private readonly widget: widgets.Editor;

  constructor(private readonly api: CoreAPI & ThemesAPI & BufferAPI & ZenAPI) {
    this.widget = new widgets.Editor(api.buffer, {
      multiLine: true,
    });

    api.core.events.on("input")(async ({ key }) => this.widget.handleInput(key));
    api.core.signals.on("render")(() => this.widget.render());

    api.core.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();
      if (api.zen.enabled) {
        this.widget.resize(columns, rows, 0, 0);
      } else {
        this.widget.resize(columns, rows - 2, 1, 0);
      }
    });

    api.theme.signals.on("change")((x) => this.widget.setTheme(x));
    api.zen.signals.on("toggle")(() => this.widget.toggleIndex());
  }

  get cursor() {
    return this.widget.cursor;
  }

  toggleWhitespace(): void {
    this.widget.toggleWhitespace();
  }

  toggleWrap(): void {
    this.widget.toggleWrap();
  }

  selectAll(): void {
    this.widget.cursor.selectAll();
  }

  copy(): void {
    this.widget.copy();
  }

  cut(): void {
    this.widget.cut();
  }

  paste(): void {
    this.widget.paste();
  }
}
