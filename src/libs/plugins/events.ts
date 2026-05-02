export type Events = {
  "start": () => void;
  "stop": (e?: PromiseRejectionEvent) => Promise<void>;
  "stop.after": (e?: PromiseRejectionEvent) => Promise<void>;
  "resize": () => void;
  "render.before": () => void;
  "render": () => void;
  "render.after": () => void;
  "debug.version": (_: string) => void;
  "debug.render": (_: number) => void;
  "debug.input": (_: number) => void;
  "status.doc.name": (_: string) => void;
  "status.doc.modified": (modified: boolean, lineCount: number) => void;
  "status.doc.cursor": (ln: number, col: number) => void;
};
