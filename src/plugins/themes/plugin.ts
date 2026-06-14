import * as events from "@libs/events";
import * as libThemes from "@libs/themes";

import { RuntimeAPI } from "@plugins/runtime";

export type ThemesAPI = ReturnType<typeof ThemesPlugin>;

export function ThemesPlugin(...api: ConstructorParameters<typeof Themes>) {
  return {
    theme: new Themes(...api),
  };
}

class Themes {
  private readonly emitter = new events.SignalEmitter<{
    "change": (_: keyof typeof libThemes.Themes) => void;
  }>();

  constructor(private readonly api: RuntimeAPI) {
    api.runtime.events.on("start")(async () => this.set("Mauve"));
  }

  readonly signals = this.emitter.listener;

  set(name: keyof typeof libThemes.Themes): void {
    this.emitter.broadcast("change", name);
  }
}
