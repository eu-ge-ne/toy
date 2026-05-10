import { Alert, Api, Ask, AskFileName, Palette } from "./api.ts";
import { DebugApi } from "./debug.ts";
import { DocApi } from "./doc.ts";

export type Plugin = {
  init?(_: Api): void;
  initDebugApi?(_: Api): DebugApi;
  initDocApi?(_: Api): DocApi;

  initPalette?(_: Api): Palette;
  initAlert?(_: Api): Alert;
  initAsk?(_: Api): Ask;
  initAskFileName?(_: Api): AskFileName;
};
