import { AlertModal } from "./alert-modal.ts";
import { ConfirmModal } from "./confirm-modal.ts";
import { Debug } from "./debug.ts";
import { FileNameModal } from "./file-name-modal.ts";
import { IO } from "./io.ts";
import { PaletteModal } from "./palette-modal.ts";
import { Runtime } from "./runtime.ts";
import { Theme } from "./theme.ts";
import { View } from "./view.ts";
import { Zen } from "./zen.ts";

export abstract class Toy {
  readonly alertModal!: AlertModal;
  readonly confirmModal!: ConfirmModal;
  readonly debug!: Debug;
  readonly fileNameModal!: FileNameModal;
  readonly io!: IO;
  readonly paletteModal!: PaletteModal;
  readonly runtime!: Runtime;
  readonly theme!: Theme;
  readonly view!: View;
  readonly zen!: Zen;
}
