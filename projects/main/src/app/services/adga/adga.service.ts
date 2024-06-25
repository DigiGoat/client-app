import ADGA from 'adga';
import { AxiosError } from 'axios';
import { app, safeStorage } from 'electron';
import { ensureFileSync, readFile, readFileSync, writeFile } from 'fs-extra';
import { join } from 'path';
import { ADGAService as ADGAServiceType } from '../../../../../shared/services/adga/adga.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class ADGAService {
  adga?: ADGA;
  accountPath = join(app.getPath('userData'), 'ADGA Account');
  account?: { username: string, password: string, id?: number, email: string, name: string; };
  noADGAMessage = Promise.reject(new Error('No ADGA Account Found!'));
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

  api: BackendService<ADGAServiceType> = {
    getAccount: async () => {
      try {
        const account = JSON.parse(safeStorage.decryptString(await readFile(this.accountPath)));
        this.account = account;
        return this.account;
      } catch (err) {
        console.warn('Error Reading Account:', err);
        return Promise.reject(new Error('Error Reading Account'));
      }
    },
    login: async (_event, username, password, id) => {
      try {
        this.adga = new ADGA(username, password);
        const info = await this.adga.getCurrentLoginInfo();
        const profile = await this.adga.getMembershipDetails();
        const account = { name: profile.account.displayName, email: info.user.emailAddress, username: username, password: password, id: id };
        this.account = account;
        await writeFile(this.accountPath, safeStorage.encryptString(JSON.stringify(account)));
        return account;
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
      this.account = JSON.parse(safeStorage.decryptString(readFileSync(this.accountPath)));
      this.adga = new ADGA(this.account.username, this.account.password);
    } catch (err) {
      console.warn('Error Accessing Account:', err);
    }
    if (this.adga) {
      (async () => {
        try {
          const info = await this.adga.getCurrentLoginInfo();
          const profile = await this.adga.getDirectlyLinkedAccounts(this.account.id);
          const account = { name: profile.displayName, email: info.user.emailAddress, username: this.account.username, password: this.account.password, id: this.account.id };
          await writeFile(this.accountPath, safeStorage.encryptString(JSON.stringify(account)));
        } catch (err) {
          console.warn('Error Updating ADGA Info (non-fatal):', err);
        }
      })();
    }
  }
}
