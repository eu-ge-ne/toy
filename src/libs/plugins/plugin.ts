import { Alert, Api, Ask } from "./api.ts";

export type Plugin = {
  register(api: Api): void;
  registerAlert?(api: Api): Alert;
  registerAsk?(api: Api): Ask;
};
