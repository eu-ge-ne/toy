import { API } from "./api.ts";

export type Plugin = (_: API) => Result;

export type Result =
  & {
    [P in keyof API]?: API[P];
  }
  & {
    init?(): void;
  };
