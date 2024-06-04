export interface GitService {
  info: () => Promise<{ installed: boolean, version: string; }>;
}
