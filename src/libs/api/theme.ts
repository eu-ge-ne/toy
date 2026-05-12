import * as events from "@libs/events";
import * as themes from "@libs/themes";

export type ThemeInterceptorEvents = Record<PropertyKey, never>;

export type ThemeReactorEvents = {
  "change": (_: keyof typeof themes.Themes) => void;
};

export type ThemeAPI = {
  events: events.Listener<ThemeInterceptorEvents, ThemeReactorEvents>;
  set(_: keyof typeof themes.Themes): void;
};
