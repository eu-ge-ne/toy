import * as api from "@libs/api";

export type Plugin = {
  init?(_: api.Toy): void;
  register?: {
    [P in keyof api.Toy]?: (_: api.Toy) => api.Toy[P];
  };
};
