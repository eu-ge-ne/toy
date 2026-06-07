import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

let signals: libEvents.SignalEmitter<api.ViewSignals>;
let widget: EditorWidget;

export default {
  register: {
    view(_: api.Toy): api.View {
      signals = new libEvents.SignalEmitter<api.ViewSignals>();

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

        undo(): void {
          widget.undo();
        },

        redo(): void {
          widget.redo();
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

  init(toy: api.Toy): void {
    widget = new EditorWidget(toy.buffer, {
      multiLine: true,
      onCursorChange: (x) => signals.broadcast("change.cursor", { ln: x.ln, col: x.col }),
    });

    toy.zen.signals.on("toggle")(() => widget.toggleIndex());
    toy.io.signals.on("render")(() => widget.render());
    toy.io.events.on("key.press")(async ({ key }) => widget.onKeyPress(key));
    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    toy.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();
      if (toy.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
} satisfies plugins.Plugin;
