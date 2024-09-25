export interface ConfigService {
  get: () => Promise<Config>;
  set: (config: Config) => Promise<void>;
  onchange: (callback: (config: Config) => void) => void;
}
export type Config = Record<string, boolean | string | Record<string, string | Record<string, string>>>;
