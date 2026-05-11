import { InterceptorData } from "@libs/events";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";

export type InterceptorEvents = {
  "start": (_: InterceptorData<{ version: string }>) => Promise<void>;
  "stop": (
    _: InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
  "key.press": (_: InterceptorData<{ key: kitty.Key }>) => Promise<void>;
};

export type ReactorEvents = {
  "resize": () => void;
  "render": () => void;
  "status.doc.name": (_: string) => void;
  "status.doc.modified": (_: { modified: boolean; lineCount: number }) => void;
  "zen.toggle": () => void;
  "theme.set": (_: keyof typeof themes.Themes) => void;
};
