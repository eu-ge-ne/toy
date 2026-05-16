import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

let widget: DebugWidget;

function resize(toy: api.Toy): void {
  const { columns, rows } = Deno.consoleSize();

  const w = std.clamp(30, 0, columns);
  const h = std.clamp(10, 0, rows);
  const y = toy.zen.enabled ? rows - h : rows - 1 - h;
  const x = columns - w;

  widget.resize(w, h, y, x);
}

export default {
  init(toy: api.Toy): void {
    widget = new DebugWidget();

    widget.version = toy.about.version;

    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
    toy.io.signals.on("render", 1000)(() => widget.render());
    toy.io.signals.on("resize")(() => resize(toy));
  },
  register: {
    debug(toy: api.Toy): api.Debug {
      let timer: number;

      function updateMemUsage(): void {
        const mem = toy.runtime.memUsage();

        widget.rss = mem.rss.toFixed();
        widget.heapTotal = mem.heapTotal.toFixed();
        widget.heapUsed = mem.heapUsed.toFixed();
        widget.externalMem = mem.external.toFixed();

        widget.render();
      }

      return {
        toggle(): void {
          widget.visible = !widget.visible;

          if (widget.visible) {
            updateMemUsage();
            timer = setInterval(updateMemUsage, 1000);
          } else {
            clearInterval(timer);
          }
        },
        setRender(x): void {
          widget.renderElapsed = x;
        },
        setInput(x): void {
          widget.inputElapsed = x;
        },
      };
    },
  },
} satisfies plugins.Plugin;
