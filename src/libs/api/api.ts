import { AboutApi } from "./about.ts";
import { AlertModalApi } from "./alert-modal.ts";
import { ConfirmModalApi } from "./confirm-modal.ts";
import { CursorApi } from "./cursor.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";
import { FileNameModalApi } from "./file-name-modal.ts";
import { IOApi } from "./io.ts";
import { PaletteModalApi } from "./palette-modal.ts";
import { RuntimeApi } from "./runtime.ts";
import { ThemeApi } from "./theme.ts";
import { ZenApi } from "./zen.ts";

export type Api = {
  runtime: RuntimeApi;
  io: IOApi;
  debug: DebugApi;
  cursor: CursorApi;
  doc: DocApi;
  theme: ThemeApi;
  zen: ZenApi;
  about: AboutApi;
  alertModal: AlertModalApi;
  confirmModal: ConfirmModalApi;
  fileNameModal: FileNameModalApi;
  paletteModal: PaletteModalApi;
};
