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

export abstract class Toy {
  readonly about!: About;
  readonly alertModal!: AlertModal;
  readonly confirmModal!: ConfirmModal;
  readonly cursor!: Cursor;
  readonly debug!: Debug;
  readonly doc!: Doc;
  readonly fileNameModal!: FileNameModal;
  readonly io!: IO;
  readonly paletteModal!: PaletteModal;
  readonly runtime!: Runtime;
  readonly theme!: Theme;
  readonly zen!: Zen;
}
