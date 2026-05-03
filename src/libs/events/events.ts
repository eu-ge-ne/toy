import { InterceptorEventDataBase, ReactorEventData } from "./data.ts";

export type SyncInterceptorEvents = {
  [key: string]: (data: InterceptorEventDataBase) => void;
};

export type AsyncInterceptorEvents = {
  [key: string]: (data: InterceptorEventDataBase) => Promise<void>;
};

export type ReactorEvents = {
  [key: string]: (data: ReactorEventData) => void | Promise<void>;
};
