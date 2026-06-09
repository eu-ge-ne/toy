import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";

import { ViewAPI, ViewSignals } from "./api.ts";

let signals: libEvents.SignalEmitter<ViewSignals>;
let widget: widgets.Editor;

export const plugin = {
  register: {
    view(): ViewAPI {
      signals = new libEvents.SignalEmitter<ViewSignals>();

      return {
        signals: signals.listener,

        toggleWhitespace(): void {
          widget.toggleWhitespace();
        },

        toggleWrap(): void {
          widget.toggleWrap();
        },

        selectAll(): void {
          widget.selectAll();
        },

        copy(): void {
          widget.copy();
        },

        cut(): void {
          widget.cut();
        },

        paste(): void {
          widget.paste();
        },
      };
    },
  },

  init(api: plugins.API): void {
    widget = new widgets.Editor(api.buffer, {
      multiLine: true,
      onCursorChange: (x) => signals.broadcast("change.cursor", { ln: x.ln, col: x.col }),
    });

    api.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
    api.zen.signals.on("toggle")(() => widget.toggleIndex());

    api.io.events.on("key.press")(async ({ key }) => widget.onKeyPress(key));
    api.io.signals.on("render")(() => widget.render());
    api.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();
      if (api.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
} satisfies plugins.Plugin;
