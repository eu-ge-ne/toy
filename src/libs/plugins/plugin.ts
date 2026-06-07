import * as api from "@libs/api";

export type Plugin = {
  register?: {
    [P in keyof api.Toy]?: (_: api.Toy) => api.Toy[P];
  };
  init?(_: api.Toy): void;
};
