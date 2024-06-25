import ADGA from 'adga';
import { AxiosError } from 'axios';
import { app, safeStorage } from 'electron';
import { ensureFileSync, readFile, readFileSync, readJSON, readJSONSync, writeFile, writeJSON } from 'fs-extra';
import { join } from 'path';
import { ADGAService as ADGAServiceType } from '../../../../../shared/services/adga/adga.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class ADGAService {
  adga?: ADGA;
  accountPath = join(app.getPath('userData'), 'ADGA Account');
  account?: { username: string, password: string, id?: number, email: string, name: string; };
  get noADGAMessage() { return Promise.reject(new Error('No ADGA Account Found!')); }
  handleError(error: Error & AxiosError) {
    if (error.isAxiosError) {
      if (error.response) {
        const response = error.response;
        if ((response.data as { error?: { message?: string; }; }).error) {
          const responseError = (error.response.data as { error?: { details?: string; }; }).error;
          if (responseError.details) {
            return Promise.reject(new Error(responseError.details));
          } else {
            return Promise.reject(new Error(JSON.stringify(responseError)));
          }
        } else {
          return Promise.reject(new Error(`Request Failed with Status Code ${response.status} - ${response.statusText}`));
        }
      }
    } else if (error.message) {
      return Promise.reject(new Error(error.message));
    } else {
      return Promise.reject(error);
    }
  }
  async readAccount() {
    if (app.isPackaged) {
      return JSON.parse(safeStorage.decryptString(await readFile(this.accountPath)));
    } else {
      return readJSON(this.accountPath + '.json');
    }
  }
  readAccountSync() {
    if (app.isPackaged) {
      return JSON.parse(safeStorage.decryptString(readFileSync(this.accountPath)));
    } else {
      return readJSONSync(this.accountPath + '.json');
    }
  }
  async writeAccount(account: { username: string, password: string, id?: number, email: string, name: string; }) {
    if (app.isPackaged) {
      await writeFile(this.accountPath, safeStorage.encryptString(JSON.stringify(account)));
    } else {
      await writeJSON(this.accountPath + '.json', account);
    }
  }
  async fetchAccount(username: string, password: string, id?: number) {
    this.adga = new ADGA(username, password);
    const info = await this.adga.getCurrentLoginInfo();
    const profile = await this.adga.getMembershipDetails();
    const account = { name: profile.account.displayName, email: info.user.emailAddress, username: username, password: password, id: id };
    this.account = account;
    await this.writeAccount(account);
    return account;
  }
  api: BackendService<ADGAServiceType> = {
    getAccount: async () => {
      try {
        const account = await this.readAccount();
        this.account = account;
        return this.account;
      } catch (err) {
        console.warn('Error Reading Account:', err);
        return Promise.reject(new Error('Error Reading Account'));
      }
    },
    login: async (_event, username, password, id) => {
      try {
        return await this.fetchAccount(username, password, id);
      } catch (err) {
        console.warn('Error Logging In:', err);
        return this.handleError(err);
      }
    },
    getOwnedGoats: async () => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      return await this.adga.getOwnedGoats(this.account?.id);
    }
  };
  constructor() {
    ensureFileSync(this.accountPath);
    try {
      this.account = this.readAccountSync();
      this.fetchAccount(this.account.username, this.account.password).catch(err => console.warn('Error Updating ADGA Info (non-fatal):', err));
    } catch (err) {
      console.warn('Error Accessing Account:', err);
    }
  }
}
