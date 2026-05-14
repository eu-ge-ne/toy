import { About } from "./about.ts";
import { AlertModal } from "./alert-modal.ts";
import { ConfirmModal } from "./confirm-modal.ts";
import { CursorAPI } from "./cursor.ts";
import { DebugAPI } from "./debug.ts";
import { DocAPI } from "./doc.ts";
import { FileNameModalAPI } from "./file-name-modal.ts";
import { IOAPI } from "./io.ts";
import { PaletteModalAPI } from "./palette-modal.ts";
import { RuntimeAPI } from "./runtime.ts";
import { ThemeAPI } from "./theme.ts";
import { ZenAPI } from "./zen.ts";

export type Host = {
  about: About;
  alertModal: AlertModal;
  confirmModal: ConfirmModal;

  runtime: RuntimeAPI;
  io: IOAPI;
  debug: DebugAPI;
  cursor: CursorAPI;
  doc: DocAPI;
  theme: ThemeAPI;
  zen: ZenAPI;
  fileNameModal: FileNameModalAPI;
  paletteModal: PaletteModalAPI;
};
