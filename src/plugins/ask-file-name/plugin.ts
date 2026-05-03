import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskFileNameWidget } from "./widget.ts";

export function register(host: plugins.Host): void {
  const widget = new AskFileNameWidget();

  host.onReact("resize", () => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(60, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = Math.trunc((rows - h) / 2);
    const x = Math.trunc((columns - w) / 2);

    widget.resize(w, h, y, x);
  });

  host.onIntercept("command", async ({ cmd }) => {
    switch (cmd.name) {
      case "Theme":
        widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  });

  host.registerAskFileName({
    async open(fileName: string): Promise<string | undefined> {
      return await widget.open(fileName);
    },
  });
}
