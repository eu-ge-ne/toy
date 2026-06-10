import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";

export default plugins.create(() => {
  return {
    buffer: new buffers.BufferAPI(),
  };
});
