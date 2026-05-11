import {
  AlertModalApi,
  Api,
  ConfirmModalApi,
  CursorApi,
  DebugApi,
  DocApi,
  FileNameModalApi,
  IOApi,
  PaletteModalApi,
} from "@libs/api";

export type Plugin = {
  init?(_: Api): void;
  ioApi?(_: Api): IOApi;
  debugApi?(_: Api): DebugApi;
  cursorApi?(_: Api): CursorApi;
  docApi?(_: Api): DocApi;
  alertModalApi?(_: Api): AlertModalApi;
  confirmModalApi?(_: Api): ConfirmModalApi;
  fileNameModalApi?(_: Api): FileNameModalApi;
  paletteModalApi?(_: Api): PaletteModalApi;
};
