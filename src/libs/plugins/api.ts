import * as events from "@libs/events";
import * as themes from "@libs/themes";

import { AlertApi } from "./alert.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";

export type Palette = {
  open(): Promise<void>;
};

export type Ask = {
  open(_: string): Promise<boolean>;
};

export type AskFileName = {
  open(_: string): Promise<string | undefined>;
};

export type Api = events.Listener<InterceptorEvents, ReactorEvents> & {
  debug: DebugApi;
  doc: DocApi;
  alert: AlertApi;

  palette: Palette;
  ask: Ask;
  askFileName: AskFileName;

  runInputLoop(
    iter: (ctx: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void>;

  emitStop(e?: PromiseRejectionEvent): Promise<void>;
  emitToggleZen(): void;
  emitSetTheme(_: keyof typeof themes.Themes): void;

  emitStatusDocName(name: string): void;
  emitStatusDocModified(modified: boolean, lineCount: number): void;
  emitStatusDocCursor(ln: number, col: number): void;
};
