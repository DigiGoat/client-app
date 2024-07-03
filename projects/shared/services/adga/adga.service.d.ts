import type { Goat, OwnedGoats } from 'adga';

export interface ADGAService {
  getAccount: () => Promise<Account>;
  login: (username: string, password: string, id?: number) => Promise<Account>;
  logout: () => Promise<void>;
  getOwnedGoats: () => Promise<OwnedGoats['result']>;
  getGoat: (id: number) => Promise<Goat['result']>;
  onchange: (callback: () => void) => void;
}
export interface Account {
  name: string;
  email: string;
  username: string;
  password: string;
  id: number;
  herdName: string;
}
