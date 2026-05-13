import { Clients } from "./clients.ts";
import { Emitter } from "./emitter.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";
import { Listener } from "./listener.ts";

export function create<
  IE extends InterceptorEvents,
  RE extends ReactorEvents,
>(): { emitter: Emitter<IE, RE>; listener: Listener<IE, RE> } {
  const clients = new Clients<IE, RE>();

  return {
    emitter: new Emitter<IE, RE>(clients),
    listener: new Listener<IE, RE>(clients),
  };
}
