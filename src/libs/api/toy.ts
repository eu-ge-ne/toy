import * as buffers from "@libs/buffers";
import * as debug from "@libs/debug";
import * as io from "@libs/io";
import * as runtime from "@libs/runtime";
import * as themes from "@libs/themes";
import * as views from "@libs/views";
import * as zen from "@libs/zen";
import { AlertModal } from "./alert-modal.ts";
import { ConfirmModal } from "./confirm-modal.ts";
import { FileNameModal } from "./file-name-modal.ts";
import { PaletteModal } from "./palette-modal.ts";

export abstract class Toy {
  readonly alertModal!: AlertModal;
  readonly buffer!: buffers.BufferAPI;
  readonly confirmModal!: ConfirmModal;
  readonly debug!: debug.DebugAPI;
  readonly fileNameModal!: FileNameModal;
  readonly io!: io.IOAPI;
  readonly paletteModal!: PaletteModal;
  readonly runtime!: runtime.RuntimeAPI;
  readonly theme!: themes.ThemeAPI;
  readonly view!: views.ViewAPI;
  readonly zen!: zen.ZenAPI;
}
