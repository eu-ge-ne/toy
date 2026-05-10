import * as commands from "@libs/commands";
import { InterceptorData } from "@libs/events";
import * as kitty from "@libs/kitty";

export type InterceptorEvents = {
  "start": (_: InterceptorData<{ version: string }>) => Promise<void>;
  "stop": (
    _: InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
  "key.press": (_: InterceptorData<{ key: kitty.Key }>) => Promise<void>;
  "command": (_: InterceptorData<{ cmd: commands.Command }>) => Promise<void>;
};

export type ReactorEvents = {
  "resize": () => void;
  "render": () => void;
  "debug.render": (_: number) => void;
  "debug.key.press": (_: number) => void;
  "status.doc.name": (_: string) => void;
  "status.doc.modified": (_: { modified: boolean; lineCount: number }) => void;
  "status.doc.cursor": (_: { ln: number; col: number }) => void;
};
