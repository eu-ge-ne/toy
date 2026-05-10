import { Alert, Api, Ask, AskFileName, Debug, Doc, Palette } from "./api.ts";

export type Plugin = {
  init?(_: Api): void;
  initPalette?(_: Api): Palette;
  initDebug?(_: Api): Debug;
  initAlert?(_: Api): Alert;
  initAsk?(_: Api): Ask;
  initAskFileName?(_: Api): AskFileName;
  initDoc?(_: Api): Doc;
};
