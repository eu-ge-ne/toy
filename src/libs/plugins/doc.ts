export type DocApi = {
  open(_: string): Promise<void>;
  save(): Promise<void>;
  saveAs(): Promise<void>;

  reset(): void;
  write(_: string): void;
  read(): Iterable<string>;

  toggleWhitespace(): void;
  toggleWrap(): void;

  selectAll(): void;
  undo(): void;
  redo(): void;
  copy(): void;
  cut(): void;
  paste(): void;
};
