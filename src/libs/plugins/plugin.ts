import { API } from "./api.ts";

export type Plugin = {
  register?: {
    [P in keyof API]?: (_: API) => API[P];
  };
  init?(_: API): void;
};
