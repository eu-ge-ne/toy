import * as events from "@libs/events";

type ZenInterceptorEvents = Record<PropertyKey, never>;

type ZenReactorEvents = {
  "toggle": () => void;
};

export abstract class ZenAPI
  extends events.Listener<ZenInterceptorEvents, ZenReactorEvents> {
  protected emitter: events.Emitter<ZenInterceptorEvents, ZenReactorEvents>;

  constructor() {
    const { emitter, clients } = events.create<
      ZenInterceptorEvents,
      ZenReactorEvents
    >();
    super(clients);

    this.emitter = emitter;
  }

  abstract enabled(): boolean;
  abstract toggle(): void;
}
