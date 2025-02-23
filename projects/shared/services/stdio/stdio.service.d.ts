export interface StdioService {
  onstdout: (callback: (data: string) => void) => void;
  onstderr: (callback: (data: string) => void) => void;
}
