import * as std from "@libs/std";
import * as libThemes from "@libs/themes";

import { IOAPI } from "@plugins/io";
import { ThemesAPI } from "@plugins/themes";

import { AlertWidget } from "./widget.ts";

export type AlertModalAPI = ReturnType<typeof AlertModalPlugin>;

export function AlertModalPlugin(api: ConstructorParameters<typeof AlertModal>[0]) {
  return {
    alertModal: new AlertModal(api),
  };
}

class AlertModal {
  private readonly widget = new AlertWidget();

  constructor(private readonly api: ThemesAPI & IOAPI) {
    api.theme.signals.on("change")((x) => this.widget.setTheme(libThemes.Themes[x]));

    api.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      this.widget.resize(w, h, y, x);
    });
  }

  async open(message: string): Promise<void> {
    let opened = true;

    this.widget.children.text.value = message;

    const offRender = this.api.io.signals.on("render", 1000)(() => this.widget.render());

    const offKeyPress = this.api.io.events.on("key.press", -1000)(
      async (data) => {
        data.cancel = true;

        switch (data.key.name) {
          case "ESC":
          case "ENTER":
            opened = false;
        }

        if (opened) {
          return;
        }

        offRender();
        offKeyPress();
      },
    );

    await this.api.io.loop(() => !opened);
  }
}
