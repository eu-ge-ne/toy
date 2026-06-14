import * as buffers from "@libs/buffers";

export type BufferAPI = ReturnType<typeof BufferPlugin>;

export function BufferPlugin() {
  return {
    buffer: new buffers.Buffer(),
  };
}
