export interface PluginParams {
  onRefresh?: () => void;
  onExit?: () => void;
}

export abstract class Plugin {
  constructor(protected readonly params: PluginParams) {
  }

  abstract start(): void;
  abstract stop(): void;
}
