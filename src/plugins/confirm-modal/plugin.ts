import * as std from "@libs/std";

import { CoreAPI } from "@plugins/core";
import { ThemesAPI } from "@plugins/themes";

import { AskWidget } from "./widget.ts";

export type ConfirmModalAPI = ReturnType<typeof ConfirmModalPlugin>;

export function ConfirmModalPlugin(...api: ConstructorParameters<typeof ConfirmModal>) {
  return {
    confirmModal: new ConfirmModal(...api),
  };
}

class ConfirmModal {
  private readonly widget = new AskWidget();

  constructor(private readonly api: CoreAPI & ThemesAPI) {
    api.core.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(7, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      this.widget.resize(w, h, y, x);
    });

    api.theme.signals.on("change")((x) => this.widget.setTheme(x));
  }

  async open(message: string): Promise<boolean> {
    let opened = true;
    let result = false;

    this.widget.children.text.value = message;

    const offRender = this.api.core.signals.on("render", 1000)(() => this.widget.render());

    const offKeyPress = this.api.core.events.on("input", -1000)(
      async (data) => {
        data.cancel = true;

        switch (data.key.name) {
          case "ESC":
            result = false;
            opened = false;
            break;
          case "ENTER":
            result = true;
            opened = false;
            break;
        }

        if (opened) {
          return;
        }

        offRender();
        offKeyPress();
      },
    );

    await this.api.core.loop(() => !opened);

    return result;
  }
}
