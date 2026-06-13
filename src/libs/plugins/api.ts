import * as buffers from "@libs/buffers";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";

export interface API {
  alertModal: {
    open(_: string): Promise<void>;
  };
  buffer: buffers.Buffer;
  confirmModal: {
    open(_: string): Promise<boolean>;
  };
  debug: {
    toggle(): void;
    setRender(_: number): void;
    setInput(_: number): void;
  };
  fileNameModal: {
    open(_: string): Promise<string | undefined>;
  };
  io: {
    events: events.Listener<IOEvents>;
    signals: events.Listener<IOSignals>;
    resize(): void;
    loop(_: () => unknown): Promise<void>;
  };
  paletteModal: {
    open(): Promise<void>;
  };
  runtime: {
    events: events.Listener<RuntimeEvents>;
    start(): Promise<void>;
    stop(e?: PromiseRejectionEvent): Promise<void>;
    open(_: string): Promise<void>;
    save(): Promise<void>;
    saveAs(): Promise<void>;
  };
  theme: {
    signals: events.Listener<ThemeSignals>;
    set(_: keyof typeof themes.Themes): void;
  };
  view: {
    signals: events.Listener<ViewSignals>;
    toggleWhitespace(): void;
    toggleWrap(): void;
    selectAll(): void;
    copy(): void;
    cut(): void;
    paste(): void;
  };
  zen: {
    signals: events.Listener<ZenSignals>;
    get enabled(): boolean;
    toggle(): void;
  };
}

export type IOEvents = {
  "key.press": (_: events.EventData<{ key: kitty.Key }>) => Promise<void>;
};

export type IOSignals = {
  "resize": () => void;
  "render": () => void;
};

export type RuntimeEvents = {
  start: (_: events.EventData) => Promise<void>;
  stop: (_: events.EventData<{ e?: PromiseRejectionEvent }>) => Promise<void>;
};

export type ThemeSignals = {
  "change": (_: keyof typeof themes.Themes) => void;
};

export type ViewSignals = {
  "change.cursor": (_: { ln: number; col: number }) => void;
};

export type ZenSignals = {
  "toggle": () => void;
};
