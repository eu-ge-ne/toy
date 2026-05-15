import { About } from "./about.ts";
import { AlertModal } from "./alert-modal.ts";
import { ConfirmModal } from "./confirm-modal.ts";
import { Cursor } from "./cursor.ts";
import { Debug } from "./debug.ts";
import { Doc } from "./doc.ts";
import { FileNameModal } from "./file-name-modal.ts";
import { IO } from "./io.ts";
import { PaletteModal } from "./palette-modal.ts";
import { Runtime } from "./runtime.ts";
import { Theme } from "./theme.ts";
import { Zen } from "./zen.ts";

export type Toy = {
  about: About;
  alertModal: AlertModal;
  confirmModal: ConfirmModal;
  cursor: Cursor;
  debug: Debug;
  doc: Doc;
  fileNameModal: FileNameModal;
  io: IO;
  paletteModal: PaletteModal;
  runtime: Runtime;
  theme: Theme;
  zen: Zen;
};
