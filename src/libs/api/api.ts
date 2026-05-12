import { AboutAPI } from "./about.ts";
import { AlertModalAPI } from "./alert-modal.ts";
import { ConfirmModalAPI } from "./confirm-modal.ts";
import { CursorAPI } from "./cursor.ts";
import { DebugAPI } from "./debug.ts";
import { DocAPI } from "./doc.ts";
import { FileNameModalAPI } from "./file-name-modal.ts";
import { IOAPI } from "./io.ts";
import { PaletteModalAPI } from "./palette-modal.ts";
import { RuntimeAPI } from "./runtime.ts";
import { ThemeAPI } from "./theme.ts";
import { ZenAPI } from "./zen.ts";

export type API = {
  runtime: RuntimeAPI;
  io: IOAPI;
  debug: DebugAPI;
  cursor: CursorAPI;
  doc: DocAPI;
  theme: ThemeAPI;
  zen: ZenAPI;
  about: AboutAPI;
  alertModal: AlertModalAPI;
  confirmModal: ConfirmModalAPI;
  fileNameModal: FileNameModalAPI;
  paletteModal: PaletteModalAPI;
};
