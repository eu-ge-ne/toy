type CancellableData = { cancel?: boolean };

// deno-lint-ignore no-explicit-any
export type InterceptorData<T = Record<string, any>> =
  & CancellableData
  & T;

type _InterceptorData =
  & CancellableData
  // deno-lint-ignore no-explicit-any
  & Record<string, any>;

// deno-lint-ignore no-explicit-any
type _ReactorData<T = any[]> = T;

export type SyncInterceptorEvents = {
  [key: string]: (data: _InterceptorData) => void;
};

export type AsyncInterceptorEvents = {
  [key: string]: (data: _InterceptorData) => Promise<void>;
};

export type ReactorEvents = {
  [key: string]: (...data: _ReactorData) => void | Promise<void>;
};
