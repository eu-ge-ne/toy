import * as std from "@libs/std";
import * as libThemes from "@libs/themes";

import * as io from "@plugins/io";
import * as themes from "@plugins/themes";
import * as zen from "@plugins/zen";

import { DebugWidget } from "./widget.ts";

const MIB = Math.pow(1024, 2);

export type API = {
  debug: {
    toggle(): void;
    setRender(_: number): void;
    setInput(_: number): void;
  };
};

export function plugin(api: themes.API & io.API & zen.API): API {
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

  function resize(): void {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(30, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = api.zen.enabled ? rows - h : rows - 1 - h;
    const x = columns - w;

    widget.resize(w, h, y, x);
  }

  api.theme.signals.on("change")((x) => widget.setTheme(libThemes.Themes[x]));
  api.io.signals.on("render", 1000)(() => widget.render());
  api.io.signals.on("resize")(() => resize());

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
