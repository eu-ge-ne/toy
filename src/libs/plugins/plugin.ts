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
  RuntimeApi,
  ThemeApi,
  ZenApi,
} from "@libs/api";

export type Plugin = {
  init?(_: Api): void;
  initRuntime?(_: Api): RuntimeApi;
  initIO?(_: Api): IOApi;
  initDebug?(_: Api): DebugApi;
  initCursor?(_: Api): CursorApi;
  initDoc?(_: Api): DocApi;
  initTheme?(_: Api): ThemeApi;
  initZen?(_: Api): ZenApi;
  initAbout?(_: Api): AboutApi;
  initAlertModal?(_: Api): AlertModalApi;
  initConfirmModal?(_: Api): ConfirmModalApi;
  initFileNameModal?(_: Api): FileNameModalApi;
  initPaletteModal?(_: Api): PaletteModalApi;
};
