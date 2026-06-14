import * as libEvents from "@libs/events";
import * as libThemes from "@libs/themes";
import * as widgets from "@libs/widgets";

import { BufferAPI } from "@plugins/buffer";
import { IOAPI } from "@plugins/io";
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
  private readonly emitter = new libEvents.SignalEmitter<{
    "change.cursor": (_: { ln: number; col: number }) => void;
  }>();

  constructor(private readonly api: ThemesAPI & BufferAPI & ZenAPI & IOAPI) {
    this.widget = new widgets.Editor(api.buffer, {
      multiLine: true,
      onCursorChange: (x) => this.emitter.broadcast("change.cursor", { ln: x.ln, col: x.col }),
    });

    api.theme.signals.on("change")((x) => this.widget.setTheme(libThemes.Themes[x]));
    api.zen.signals.on("toggle")(() => this.widget.toggleIndex());

    api.io.events.on("key.press")(async ({ key }) => this.widget.onKeyPress(key));
    api.io.signals.on("render")(() => this.widget.render());
    api.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();
      if (api.zen.enabled) {
        this.widget.resize(columns, rows, 0, 0);
      } else {
        this.widget.resize(columns, rows - 2, 1, 0);
      }
    });
  }

  readonly signals = this.emitter.listener;

  toggleWhitespace(): void {
    this.widget.toggleWhitespace();
  }

  toggleWrap(): void {
    this.widget.toggleWrap();
  }

  selectAll(): void {
    this.widget.selectAll();
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
