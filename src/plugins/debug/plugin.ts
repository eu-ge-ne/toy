import * as std from "@libs/std";
import * as libThemes from "@libs/themes";

import { IOAPI } from "@plugins/io";
import { ThemesAPI } from "@plugins/themes";
import { ZenAPI } from "@plugins/zen";

import { DebugWidget } from "./widget.ts";

const MIB = Math.pow(1024, 2);

export type DebugAPI = ReturnType<typeof DebugPlugin>;

export function DebugPlugin(...api: ConstructorParameters<typeof Debug>) {
  return {
    debug: new Debug(...api),
  };
}

class Debug {
  private readonly widget = new DebugWidget();
  private timer!: NodeJS.Timeout;

  constructor(private readonly api: ThemesAPI & IOAPI & ZenAPI) {
    this.widget.version = std.version;

    api.theme.signals.on("change")((x) => this.widget.setTheme(libThemes.Themes[x]));
    api.io.signals.on("render", 1000)(() => this.widget.render());

    api.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = api.zen.enabled ? rows - h : rows - 1 - h;
      const x = columns - w;

      this.widget.resize(w, h, y, x);
    });

    api.io.signals.on("render.completed")((x) => {
      this.widget.renderElapsed = x;
    });

    api.io.signals.on("key.handled")((x) => {
      this.widget.inputElapsed = x;
    });
  }

  toggle(): void {
    this.widget.visible = !this.widget.visible;

    if (this.widget.visible) {
      this.#updateMemUsage();
      this.timer = setInterval(this.#updateMemUsage.bind(this), 1000);
    } else {
      clearInterval(this.timer);
    }
  }

  #updateMemUsage(): void {
    const mem = Deno.memoryUsage();

    this.widget.rss = (mem.rss / MIB).toFixed();
    this.widget.heapTotal = (mem.heapTotal / MIB).toFixed();
    this.widget.heapUsed = (mem.heapUsed / MIB).toFixed();
    this.widget.externalMem = (mem.external / MIB).toFixed();

    this.widget.render();
  }
}
