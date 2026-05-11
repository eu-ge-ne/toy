import * as events from "@libs/events";
import * as themes from "@libs/themes";

export type InterceptorEvents = {
  "start": (_: events.InterceptorData<{ version: string }>) => Promise<void>;
  "stop": (
    _: events.InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
};

export type ReactorEvents = {
  "zen.toggle": () => void;
  "theme.set": (_: keyof typeof themes.Themes) => void;
};
