import { Alert, Api, Ask, AskFileName, Doc } from "./api.ts";

export type Plugin = {
  register(api: Api): void;
  registerAlert?(api: Api): Alert;
  registerAsk?(api: Api): Ask;
  registerAskFileName?(api: Api): AskFileName;
  registerDoc?(api: Api): Doc;
};
