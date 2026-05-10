import * as events from "@libs/events";
import * as themes from "@libs/themes";

import { AlertModalApi } from "./alert-modal.ts";
import { ConfirmModalApi } from "./confirm-modal.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";
import { FileNameModalApi } from "./file-name-modal.ts";
import { PaletteModalApi } from "./palette-modal.ts";

export type Api = events.Listener<InterceptorEvents, ReactorEvents> & {
  debug: DebugApi;
  doc: DocApi;
  alertModal: AlertModalApi;
  confirmModal: ConfirmModalApi;
  fileNameModal: FileNameModalApi;
  paletteModal: PaletteModalApi;

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
