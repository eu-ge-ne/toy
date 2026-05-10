import * as events from "@libs/events";
import * as themes from "@libs/themes";

import { AlertApi } from "./alert.ts";
import { ConfirmApi } from "./confirm.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";
import { PaletteApi } from "./palette.ts";

export type AskFileName = {
  open(_: string): Promise<string | undefined>;
};

export type Api = events.Listener<InterceptorEvents, ReactorEvents> & {
  debug: DebugApi;
  doc: DocApi;
  alert: AlertApi;
  confirm: ConfirmApi;
  askFileName: AskFileName;
  palette: PaletteApi;

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
