import { Clients } from "./clients.ts";
import { Emitter } from "./emitter.ts";
import { BroadcastedEvents, DispatchedEvents } from "./events.ts";
import { Listener } from "./listener.ts";

export function create<
  DE extends DispatchedEvents,
  BE extends BroadcastedEvents,
>(): { emitter: Emitter<DE, BE>; listener: Listener<DE, BE> } {
  const clients = new Clients<DE, BE>();

  return {
    emitter: new Emitter<DE, BE>(clients),
    listener: new Listener<DE, BE>(clients),
  };
}
