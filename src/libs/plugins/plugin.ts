import { Alert, Api } from "./api.ts";

export type Plugin = {
  register(api: Api): void;
  registerAlert?(api: Api): Alert;
};
