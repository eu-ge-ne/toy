import * as std from "@libs/std";
import * as libThemes from "@libs/themes";

import { IOAPI } from "@plugins/io";
import { ThemesAPI } from "@plugins/themes";
import { ZenAPI } from "@plugins/zen";

import { DebugWidget } from "./widget.ts";

const MIB = Math.pow(1024, 2);

export type DebugAPI = {
  debug: {
    toggle(): void;
  };
};

export function DebugPlugin(api: ThemesAPI & IOAPI & ZenAPI): DebugAPI {
  const widget = new DebugWidget();
  widget.version = std.version;

  let timer: NodeJS.Timeout;

  function updateMemUsage(): void {
    const mem = Deno.memoryUsage();

    widget.rss = (mem.rss / MIB).toFixed();
    widget.heapTotal = (mem.heapTotal / MIB).toFixed();
    widget.heapUsed = (mem.heapUsed / MIB).toFixed();
    widget.externalMem = (mem.external / MIB).toFixed();

    widget.render();
  }

  api.theme.signals.on("change")((x) => widget.setTheme(libThemes.Themes[x]));
  api.io.signals.on("render", 1000)(() => widget.render());

  api.io.signals.on("resize")(() => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(30, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = api.zen.enabled ? rows - h : rows - 1 - h;
    const x = columns - w;

    widget.resize(w, h, y, x);
  });

  api.io.signals.on("render.completed")((x) => {
    widget.renderElapsed = x;
  });

  api.io.signals.on("key.handled")((x) => {
    widget.inputElapsed = x;
  });

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
    },
  };
}
