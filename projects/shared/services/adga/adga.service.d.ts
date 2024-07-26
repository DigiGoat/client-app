import type { Goat, Goats, OwnedGoats } from 'adga';

export interface ADGAService {
  getAccount: () => Promise<Account>;
  login: (username: string, password: string, id?: number) => Promise<Account>;
  logout: () => Promise<void>;
  getOwnedGoats: () => Promise<OwnedGoats['result']>;
  getGoat: (id: number) => Promise<Goat['result']>;
  blacklistOwnedGoat: (id: number) => Promise<void>;
  onchange: (callback: () => void) => void;
  lookupGoatsById: (normalizeId: string) => Promise<Goats['result']['items']>;
  lookupGoatsByName: (name: string) => Promise<Goats['result']['items']>;
}
export interface Account {
  name: string;
  email: string;
  username: string;
  password: string;
  id: number;
  herdName: string;
}
