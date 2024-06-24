import type { OwnedGoats } from 'adga';

export interface ADGAService {
  getAccount: () => Promise<Account>;
  login: (username: string, password: string, id?: number) => Promise<Account>;
  getOwnedGoats: () => Promise<OwnedGoats['result']>;
}
export interface Account {
  name: string;
  email: string;
  username: string;
  password: string;
  id?: number;
}
