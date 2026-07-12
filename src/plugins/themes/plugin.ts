import * as events from "@libs/events";
import * as themes from "@libs/themes";

export type API = {
  theme: Themes;
};

export function Plugin(): API {
  return {
    theme: new Themes(),
  };
}

class Themes {
  private readonly emitter = new events.SignalEmitter<{
    "change": (_: themes.Theme) => void;
  }>();

  readonly signals = this.emitter.listener;

  set(name: keyof typeof themes.Themes): void {
    this.emitter.broadcast("change", themes.Themes[name]);
  }
}
