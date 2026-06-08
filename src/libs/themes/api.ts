import * as events from "@libs/events";
import * as themes from "@libs/themes";

export type ThemeSignals = {
  "change": (_: keyof typeof themes.Themes) => void;
};

export type ThemeAPI = {
  signals: events.Listener<ThemeSignals>;
  set(_: keyof typeof themes.Themes): void;
};
