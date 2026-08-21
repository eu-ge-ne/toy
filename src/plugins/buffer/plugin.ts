import { Buffer } from "@libs/buffer";

export type API = {
  buffer: Buffer;
};

export function Plugin(): API {
  return {
    buffer: new Buffer(),
  };
}
