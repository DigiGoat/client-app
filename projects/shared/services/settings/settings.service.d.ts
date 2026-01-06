export interface SettingsService {
  get: () => Promise<Settings>;
  set: (settings: Settings) => Promise<void>;
  onchange: (callback: (settings: Settings) => void) => void;
}

export type Settings = Partial<{
  analytics: Partial<{
    gtag: string;
    clarity: string;
  }>;
  firebase: Partial<{
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string;
    appId: string;
  }>;
  url: string;
  internationalImages: boolean;
}>;
