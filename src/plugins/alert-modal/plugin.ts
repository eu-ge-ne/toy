import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { CoreAPI } from "@plugins/core";
import { ThemesAPI } from "@plugins/themes";

import { AlertWidget } from "./widget.ts";

export type AlertModalAPI = ReturnType<typeof AlertModalPlugin>;

export function AlertModalPlugin(...api: ConstructorParameters<typeof AlertModal>) {
  return {
    alertModal: new AlertModal(...api),
  };
}

class AlertModal {
  private readonly widget = new AlertWidget();

  constructor(private readonly api: CoreAPI & ThemesAPI) {
    api.core.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      this.widget.resize(w, h, y, x);
    });

    api.theme.signals.on("change")((x) => this.widget.setTheme(themes.Themes[x]));
  }

  async open(message: string): Promise<void> {
    let opened = true;

    this.widget.children.text.value = message;

    const offRender = this.api.core.signals.on("render", 1000)(() => this.widget.render());

    const offKeyPress = this.api.core.events.on("input", -1000)(
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

    await this.api.core.loop(() => !opened);
  }
}
