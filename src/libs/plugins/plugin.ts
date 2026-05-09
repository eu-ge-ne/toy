import { Alert, Api, Ask, AskFileName, Doc, Files } from "./api.ts";

export type Plugin = {
  init?(api: Api): void;
  initAlert?(api: Api): Alert;
  initAsk?(api: Api): Ask;
  initAskFileName?(api: Api): AskFileName;
  initDoc?(api: Api): Doc;
  initFiles?(api: Api): Files;
};
