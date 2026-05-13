type CancellableData = { cancel?: boolean };

// deno-lint-ignore no-explicit-any
export type DispatchData<T = Record<string, any>> =
  & CancellableData
  & T;

// deno-lint-ignore no-explicit-any
type _DispatchData = any;

// deno-lint-ignore no-explicit-any
type _BroadcastData = any[];

export type DispatchedEvents = {
  [key: string]: (data: _DispatchData) => Promise<void>;
};

export type BroadcastedEvents = {
  [key: string]: (...data: _BroadcastData) => void | Promise<void>;
};
