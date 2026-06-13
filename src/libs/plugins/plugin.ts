import { API } from "./api.ts";

export type PluginConstructor = (_: API) => Plugin;

export type Plugin =
  & {
    [P in keyof API]?: API[P];
  }
  & {
    init?(): void;
  };
