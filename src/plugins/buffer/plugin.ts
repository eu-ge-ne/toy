import * as buffers from "@libs/buffers";

export type BufferAPI = {
  buffer: buffers.Buffer;
};

export function BufferPlugin(): BufferAPI {
  return {
    buffer: new buffers.Buffer(),
  };
}
