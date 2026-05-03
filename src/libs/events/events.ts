type CancellableData = { cancel?: boolean };

// deno-lint-ignore no-explicit-any
export type InterceptorData<T = Record<string, any>> =
  & CancellableData
  & T;

// deno-lint-ignore no-explicit-any
type _InterceptorData = any;

// deno-lint-ignore no-explicit-any
type _ReactorData = any[];

export type InterceptorEvents = {
  [key: string]: (data: _InterceptorData) => Promise<void>;
};

export type ReactorEvents = {
  [key: string]: (...data: _ReactorData) => void | Promise<void>;
};
