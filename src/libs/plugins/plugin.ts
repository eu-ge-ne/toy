import { AlertApi } from "./alert.ts";
import { Api, AskFileName } from "./api.ts";
import { ConfirmApi } from "./confirm.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";
import { PaletteApi } from "./palette.ts";

export type Plugin = {
  init?(_: Api): void;
  debugApi?(_: Api): DebugApi;
  docApi?(_: Api): DocApi;
  alertApi?(_: Api): AlertApi;
  confirmApi?(_: Api): ConfirmApi;
  initAskFileName?(_: Api): AskFileName;
  paletteApi?(_: Api): PaletteApi;
};
