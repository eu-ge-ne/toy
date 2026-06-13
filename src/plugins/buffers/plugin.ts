import * as buffers from "@libs/buffers";

export type API = {
  buffer: buffers.Buffer;
};

export function plugin(): API {
  return {
    buffer: new buffers.Buffer(),
  };
}
