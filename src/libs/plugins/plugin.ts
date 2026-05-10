import { AlertApi } from "./alert.ts";
import { Api, Ask, AskFileName, Palette } from "./api.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";

export type Plugin = {
  init?(_: Api): void;
  debugApi?(_: Api): DebugApi;
  docApi?(_: Api): DocApi;
  alertApi?(_: Api): AlertApi;

  initPalette?(_: Api): Palette;
  initAsk?(_: Api): Ask;
  initAskFileName?(_: Api): AskFileName;
};
