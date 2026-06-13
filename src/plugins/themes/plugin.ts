import * as events from "@libs/events";
import * as libThemes from "@libs/themes";

import { RuntimeAPI } from "@plugins/runtime";

export type ThemesAPI = {
  theme: {
    signals: events.Listener<ThemeSignals>;
    set(_: keyof typeof libThemes.Themes): void;
  };
};

type ThemeSignals = {
  "change": (_: keyof typeof libThemes.Themes) => void;
};

export function ThemesPlugin(api: RuntimeAPI): ThemesAPI {
  const signals = new events.SignalEmitter<ThemeSignals>();

  function set(name: keyof typeof libThemes.Themes): void {
    signals.broadcast("change", name);
  }

  api.runtime.events.on("start")(async () => set("Mauve"));

  return {
    theme: {
      signals: signals.listener,

      set,
    },
  };
}
