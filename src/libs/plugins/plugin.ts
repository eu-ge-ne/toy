import {
  AboutApi,
  AlertModalApi,
  Api,
  ConfirmModalApi,
  CursorApi,
  DebugApi,
  DocApi,
  FileNameModalApi,
  IOApi,
  PaletteModalApi,
  ThemeApi,
  ZenApi,
} from "@libs/api";

export type Plugin = {
  start?(_: Api): void;
  ioApi?(_: Api): IOApi;
  debugApi?(_: Api): DebugApi;
  cursorApi?(_: Api): CursorApi;
  docApi?(_: Api): DocApi;
  themeApi?(_: Api): ThemeApi;
  zenApi?(_: Api): ZenApi;
  aboutApi?(_: Api): AboutApi;
  alertModalApi?(_: Api): AlertModalApi;
  confirmModalApi?(_: Api): ConfirmModalApi;
  fileNameModalApi?(_: Api): FileNameModalApi;
  paletteModalApi?(_: Api): PaletteModalApi;
};
