type Cancellable = { cancel?: boolean };

// deno-lint-ignore no-explicit-any
export type DispatchedData<T = Record<string, any>> =
  & Cancellable
  & T;

// deno-lint-ignore no-explicit-any
type _DispatchedData = any;

// deno-lint-ignore no-explicit-any
type _BroadcastedData = any[];

export type DispatchedEvents = {
  [key: string]: (data: _DispatchedData) => Promise<void>;
};

export type BroadcastedEvents = {
  [key: string]: (...data: _BroadcastedData) => void | Promise<void>;
};
