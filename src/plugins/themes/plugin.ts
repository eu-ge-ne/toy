import * as events from "@libs/events";
import * as themes from "@libs/themes";

export type ThemesAPI = ReturnType<typeof ThemesPlugin>;

export function ThemesPlugin(...api: ConstructorParameters<typeof Themes>) {
  return {
    theme: new Themes(...api),
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
