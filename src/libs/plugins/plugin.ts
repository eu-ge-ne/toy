import { API } from "./api.ts";

export type Plugin = (_: API) =>
  & {
    [P in keyof API]?: API[P];
  }
  & {
    init?(): void;
  };

export function create(x: Plugin): Plugin {
  return x;
}
