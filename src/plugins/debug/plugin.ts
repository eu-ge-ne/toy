import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { CoreAPI } from "@plugins/core";
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

  constructor(private readonly api: CoreAPI & ThemesAPI & ZenAPI) {
    this.widget.version = std.version;

    api.core.signals.on("render", 1000)(() => this.widget.render());

    api.core.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = api.zen.enabled ? rows - h : rows - 1 - h;
      const x = columns - w;

      this.widget.resize(w, h, y, x);
    });

    api.core.signals.on("render.completed")((x) => {
      this.widget.renderElapsed = x;
    });

    api.core.signals.on("input.processed")((x) => {
      this.widget.inputElapsed = x;
    });

    api.theme.signals.on("change")((x) => this.widget.setTheme(themes.Themes[x]));
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
