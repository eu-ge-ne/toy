import * as buffers from "@libs/buffers";
import * as io from "@libs/io";
import * as themes from "@libs/themes";
import * as views from "@libs/views";

import { AlertModal } from "./alert-modal.ts";
import { ConfirmModal } from "./confirm-modal.ts";
import { Debug } from "./debug.ts";
import { FileNameModal } from "./file-name-modal.ts";
import { PaletteModal } from "./palette-modal.ts";
import { Runtime } from "./runtime.ts";
import { Zen } from "./zen.ts";

export abstract class Toy {
  readonly alertModal!: AlertModal;
  readonly buffer!: buffers.BufferAPI;
  readonly confirmModal!: ConfirmModal;
  readonly debug!: Debug;
  readonly fileNameModal!: FileNameModal;
  readonly io!: io.IOAPI;
  readonly paletteModal!: PaletteModal;
  readonly runtime!: Runtime;
  readonly theme!: themes.ThemeAPI;
  readonly view!: views.ViewAPI;
  readonly zen!: Zen;
}
