import * as events from "@libs/events";
import * as themes from "@libs/themes";

import { CoreAPI } from "@plugins/core";

export type ThemesAPI = ReturnType<typeof ThemesPlugin>;

export function ThemesPlugin(...api: ConstructorParameters<typeof Themes>) {
  return {
    theme: new Themes(...api),
  };
}

class Themes {
  private readonly emitter = new events.SignalEmitter<{
    "change": (_: keyof typeof themes.Themes) => void;
  }>();

  constructor(private readonly api: CoreAPI) {
    api.core.events.on("start")(async () => this.set("Mauve"));
  }

  readonly signals = this.emitter.listener;

  set(name: keyof typeof themes.Themes): void {
    this.emitter.broadcast("change", name);
  }
}
