import { Alert, Api, Ask, AskFileName, Doc, Files, Palette } from "./api.ts";

export type Plugin = {
  init?(_: Api): void;
  initPalette?(_: Api): Palette;
  initAlert?(_: Api): Alert;
  initAsk?(_: Api): Ask;
  initAskFileName?(_: Api): AskFileName;
  initDoc?(_: Api): Doc;
  initFiles?(_: Api): Files;
};
