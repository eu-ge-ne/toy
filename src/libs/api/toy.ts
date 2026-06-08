import * as alertModal from "@libs/alert-modal";
import * as buffers from "@libs/buffers";
import * as confirmModal from "@libs/confirm-modal";
import * as debug from "@libs/debug";
import * as fileNameModal from "@libs/file-name-modal";
import * as io from "@libs/io";
import * as paletteModal from "@libs/palette-modal";
import * as runtime from "@libs/runtime";
import * as themes from "@libs/themes";
import * as views from "@libs/views";
import * as zen from "@libs/zen";

export abstract class Toy {
  readonly alertModal!: alertModal.AlertModalAPI;
  readonly buffer!: buffers.BufferAPI;
  readonly confirmModal!: confirmModal.ConfirmModalAPI;
  readonly debug!: debug.DebugAPI;
  readonly fileNameModal!: fileNameModal.FileNameModalAPI;
  readonly io!: io.IOAPI;
  readonly paletteModal!: paletteModal.PaletteModalAPI;
  readonly runtime!: runtime.RuntimeAPI;
  readonly theme!: themes.ThemeAPI;
  readonly view!: views.ViewAPI;
  readonly zen!: zen.ZenAPI;
}
