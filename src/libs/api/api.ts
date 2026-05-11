import * as events from "@libs/events";
import * as themes from "@libs/themes";

import { AlertModalApi } from "./alert-modal.ts";
import { ConfirmModalApi } from "./confirm-modal.ts";
import { CursorApi } from "./cursor.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";
import { FileNameModalApi } from "./file-name-modal.ts";
import { IOApi } from "./io.ts";
import { PaletteModalApi } from "./palette-modal.ts";

export type Api = events.Listener<InterceptorEvents, ReactorEvents> & {
  io: IOApi;
  debug: DebugApi;
  cursor: CursorApi;
  doc: DocApi;
  alertModal: AlertModalApi;
  confirmModal: ConfirmModalApi;
  fileNameModal: FileNameModalApi;
  paletteModal: PaletteModalApi;

  emitStop(e?: PromiseRejectionEvent): Promise<void>;
  emitToggleZen(): void;
  emitSetTheme(_: keyof typeof themes.Themes): void;
};
