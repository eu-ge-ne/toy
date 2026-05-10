import { Alert, Api, Ask, AskFileName, Doc, Palette } from "./api.ts";
import { DebugApi } from "./debug.ts";

export type Plugin = {
  init?(_: Api): void;
  initDebugApi?(_: Api): DebugApi;

  initPalette?(_: Api): Palette;
  initAlert?(_: Api): Alert;
  initAsk?(_: Api): Ask;
  initAskFileName?(_: Api): AskFileName;
  initDoc?(_: Api): Doc;
};
