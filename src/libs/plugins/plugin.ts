import { AlertModalApi } from "./alert-modal.ts";
import { Api } from "./api.ts";
import { ConfirmModalApi } from "./confirm-modal.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";
import { FileNameModalApi } from "./file-name-modal.ts";
import { PaletteModalApi } from "./palette-modal.ts";

export type Plugin = {
  init?(_: Api): void;
  debugApi?(_: Api): DebugApi;
  docApi?(_: Api): DocApi;
  alertModalApi?(_: Api): AlertModalApi;
  confirmModalApi?(_: Api): ConfirmModalApi;
  fileNameModalApi?(_: Api): FileNameModalApi;
  paletteModalApi?(_: Api): PaletteModalApi;
};
