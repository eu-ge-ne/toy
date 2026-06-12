import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

const MIB = Math.pow(1024, 2);

export function plugin(api: plugins.API): plugins.Result {
  const widget = new DebugWidget();
  widget.version = std.version;

  let timer: NodeJS.Timeout;

  function updateMemUsage(): void {
    const mem = memUsage();

    widget.rss = mem.rss.toFixed();
    widget.heapTotal = mem.heapTotal.toFixed();
    widget.heapUsed = mem.heapUsed.toFixed();
    widget.externalMem = mem.external.toFixed();

    widget.render();
  }

  function resize(api: plugins.API): void {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(30, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = api.zen.enabled ? rows - h : rows - 1 - h;
    const x = columns - w;

    widget.resize(w, h, y, x);
  }

  return {
    debug: {
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
    },

    init(): void {
      api.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
      api.io.signals.on("render", 1000)(() => widget.render());
      api.io.signals.on("resize")(() => resize(api));
    },
  };
}

function memUsage(): { rss: number; heapTotal: number; heapUsed: number; external: number } {
  const mem = Deno.memoryUsage();

  return {
    rss: mem.rss / MIB,
    heapTotal: mem.heapTotal / MIB,
    heapUsed: mem.heapUsed / MIB,
    external: mem.external / MIB,
  };
}
