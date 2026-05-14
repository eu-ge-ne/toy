import * as events from "@libs/events";
import * as themes from "@libs/themes";

export type ThemeEvents = Record<PropertyKey, never>;

export type ThemeReactorEvents = {
  "change": (_: keyof typeof themes.Themes) => void;
};

export type Theme = {
  events: events.Listener<ThemeEvents, ThemeReactorEvents>;
  set(_: keyof typeof themes.Themes): void;
};
