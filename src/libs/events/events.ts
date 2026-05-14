type Cancellable = { cancel?: boolean };

// deno-lint-ignore no-explicit-any
export type EventData<T = Record<string, any>> = Cancellable & T;

// deno-lint-ignore no-explicit-any
type _EventData = any;

// deno-lint-ignore no-explicit-any
type _BroadcastedData = any[];

export type Events = {
  [key: string]: (data: _EventData) => Promise<void>;
};

export type BroadcastedEvents = {
  [key: string]: (...data: _BroadcastedData) => void | Promise<void>;
};
