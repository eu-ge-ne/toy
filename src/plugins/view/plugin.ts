import * as libEvents from "@libs/events";
import * as libThemes from "@libs/themes";
import * as widgets from "@libs/widgets";

import { BufferAPI } from "@plugins/buffer";
import { IOAPI } from "@plugins/io";
import { ThemesAPI } from "@plugins/themes";
import { ZenAPI } from "@plugins/zen";

export type ViewAPI = {
  view: {
    signals: libEvents.Listener<ViewSignals>;
    toggleWhitespace(): void;
    toggleWrap(): void;
    selectAll(): void;
    copy(): void;
    cut(): void;
    paste(): void;
  };
};

type ViewSignals = {
  "change.cursor": (_: { ln: number; col: number }) => void;
};

export function ViewPlugin(api: ThemesAPI & BufferAPI & ZenAPI & IOAPI): ViewAPI {
  const signals = new libEvents.SignalEmitter<ViewSignals>();

  const widget = new widgets.Editor(api.buffer, {
    multiLine: true,
    onCursorChange: (x) => signals.broadcast("change.cursor", { ln: x.ln, col: x.col }),
  });

  api.theme.signals.on("change")((x) => widget.setTheme(libThemes.Themes[x]));
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

  return {
    view: {
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
    },
  };
}
