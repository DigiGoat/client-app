import type { Awards, Goat, Goats, LinearAppraisal, OwnedGoats } from 'adga';

export interface ADGAService {
  getAccount: () => Promise<Account>;
  login: (username: string, password: string, id?: number) => Promise<Account>;
  logout: () => Promise<void>;
  getOwnedGoats: () => Promise<OwnedGoats['result']>;
  getGoat: (id: number) => Promise<Goat['result']>;
  getGoats: (ids: number[]) => Promise<Goats['result']>;
  onchange: (callback: () => void) => void;
  lookupGoatsById: (normalizeId: string) => Promise<Goats['result']['items']>;
  lookupGoatsByName: (name: string) => Promise<Goats['result']['items']>;
  blacklistOwnedGoat: (id: number) => Promise<void>;
  getBlacklist: () => Promise<number[]>;
  getLinearAppraisal: (id: number) => Promise<LinearAppraisal['result']['items']>;
  getAwards: (id: number) => Promise<Awards['result']['items']>;
}
export interface Account {
  name: string;
  email: string;
  username: string;
  password: string;
  id: number;
  herdName: string;
}
