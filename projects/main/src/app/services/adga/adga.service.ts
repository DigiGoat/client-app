import ADGA from 'adga';
import CDCB, { LactationType } from 'adga/cdcb';
import { AxiosError } from 'axios';
import { BrowserWindow, app, safeStorage } from 'electron';
import { ensureFile, ensureFileSync, readFile, readFileSync, readJSON, readJSONSync, writeFile, writeJSON } from 'fs-extra';
import { join } from 'path';
import { ADGAService as ADGAServiceType, type Account } from '../../../../../shared/services/adga/adga.service';
import type { LactationRecord } from '../../../../../shared/services/goat/goat.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class ADGAService {
  adga?: ADGA;
  cdcb: CDCB;
  accountPath = join(app.getPath('userData'), 'ADGA Account');
  blacklistPath = join(app.getPath('userData'), 'ADGA Blacklist');
  account?: Account;
  get noADGAMessage() { return Promise.reject(new Error('No ADGA Account Found!')); }
  handleError(error: Error & AxiosError) {
    if (error.isAxiosError && error.response) {
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
    } else if (error.message) {
      return Promise.reject(new Error(error.message));
    } else {
      return Promise.reject(error);
    }
  }
  async readAccount() {
    if (app.isPackaged) {
      await ensureFile(this.accountPath);
      return JSON.parse(safeStorage.decryptString(await readFile(this.accountPath)));
    } else {
      await ensureFile(this.accountPath + '.json');
      return readJSON(this.accountPath + '.json');
    }
  }
  readAccountSync() {
    if (app.isPackaged) {
      ensureFileSync(this.accountPath);
      return JSON.parse(safeStorage.decryptString(readFileSync(this.accountPath)));
    } else {
      ensureFileSync(this.accountPath + '.json');
      return readJSONSync(this.accountPath + '.json');
    }
  }
  async writeAccount(account: Account) {
    if (app.isPackaged) {
      await writeFile(this.accountPath, safeStorage.encryptString(JSON.stringify(account)));
    } else {
      await writeJSON(this.accountPath + '.json', account);
    }
    this.change();
  }
  async fetchAccount(username: string, password: string, id?: number) {
    try {
      this.adga = new ADGA(username, password);
      const info = await this.adga.getCurrentLoginInfo();
      const profile = await this.adga.getMembershipDetails();
      const account = { name: profile.account.displayName, email: info.user.emailAddress, username: username, password: password, id: id ?? info.accountProfile.account.id, herdName: info.accountProfile.herdName };
      this.account = account;
      return account;
    } catch (error) {
      //this.adga = undefined;
      return this.handleError(error);
    } finally {
      await this.writeAccount(this.account);
    }
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
    logout: async () => {
      await this.writeAccount({} as Account);
      this.adga = undefined;
    },
    getOwnedGoats: async () => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      try {
        const blacklist = await readJSON(this.blacklistPath).catch(() => [] as string[]);
        const goats = await this.adga.getOwnedGoats(this.account?.id);
        goats.items = goats.items.filter(goat => !blacklist.includes(goat.id));
        return goats;
      } catch (err) {
        console.warn('Error Fetching Owned Goats:', err);
        return this.handleError(err);
      }
    },
    getGoat: async (_event, id) => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      try {
        return await this.adga.getGoat(id);
      } catch (err) {
        console.warn('Error Fetching Goat:', err);
        return this.handleError(err);
      }
    },
    getGoats: async (_event, ids) => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      try {
        return await this.adga.getGoats(ids);
      } catch (err) {
        console.warn('Error Fetching Goats:', err);
        return this.handleError(err);
      }
    },
    getCDCBGoat: async (_event, normalizeId) => {
      try {
        return await this.cdcb.searchAnimal(normalizeId);
      } catch (err) {
        console.warn('Error Fetching CDCB Goat:', err);
        return this.handleError(err);
      }
    },
    getLactations: async (_event, usdaId, animalKey) => {
      try {
        const lactations = await this.cdcb.getAnimalLactations(usdaId, animalKey);
        // Run all per-lactation requests in parallel, preserving order
        const records: LactationRecord[] = await Promise.all(
          lactations.map(async (lactation) => {
            const lactationTests = await this.cdcb.getLactationsTestDate(usdaId, animalKey, lactation.calvPdate, lactation.herdCode);
            const stats: LactationRecord['stats'] = { milk: {}, butterfat: {}, protein: {} };
            for (const stat of lactationTests.lactationStds) {
              if (stat.typeName === 'Actual') {
                stats.milk.projected = stat.mlk;
                stats.butterfat.projected = stat.fat;
                stats.protein.projected = stat.pro;
              } else if (stat.typeName === 'Standard') {
                stats.milk.achieved = stat.mlk;
                stats.butterfat.achieved = stat.fat;
                stats.protein.achieved = stat.pro;
              }
            }
            const tests: LactationRecord['tests'] = [];
            for (const test of lactationTests.testDates) {
              tests.push({
                testNumber: test.testNo,
                testDate: test.testDate,
                milk: test.milk,
                butterfatPct: test.fatPct,
                proteinPct: test.proPct,
                daysInMilk: test.dim,
              });
            }
            const record: LactationRecord = {
              startDate: lactation.freshDate,
              isCurrent: lactation.lt === LactationType.IN_PROGRESS,
              lactationNumber: lactation.lactNum,
              daysInMilk: lactation.dim,
              stats: stats,
              tests: tests,
            };
            return record;
          })
        );
        // CDCB returns lactations in reverse order, so reverse to match original unshift logic
        return records.reverse();
      } catch (err) {
        console.warn('Error Fetching Lactations:', err);
        return this.handleError(err);
      }
    },
    lookupGoatsById: async (_event, normalizeId) => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      try {
        return (await this.adga.getAllGoatsByNormalizeId(normalizeId)).items;
      } catch (err) {
        console.warn('Error Looking Up Goats:', err);
        return this.handleError(err);
      }
    },
    lookupGoatsByName: async (_event, name) => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      try {
        return (await this.adga.getAllGoatsByName(name)).items;
      } catch (err) {
        console.warn('Error Looking Up Goats:', err);
        return this.handleError(err);
      }
    },
    blacklistOwnedGoat: async (_event, id) => {
      const blacklist = await readJSON(this.blacklistPath).catch(() => [] as string[]);
      blacklist.push(id);
      await writeJSON(this.blacklistPath, blacklist);
    },
    getBlacklist: async () => {
      return await readJSON(this.blacklistPath).catch(() => [] as string[]);
    },
    getLinearAppraisal: async (_event, id) => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      try {
        return (await this.adga.getLinearAppraisal(id)).items;
      } catch (err) {
        console.warn('Error Fetching Linear Appraisal:', err);
        return this.handleError(err);
      }
    },
    getAwards: async (_event, id) => {
      if (!this.adga) {
        return this.noADGAMessage;
      }
      try {
        return (await this.adga.getAwards(id)).items;
      } catch (err) {
        console.warn('Error Fetching Awards:', err);
        return this.handleError(err);
      }
    },
  };
  constructor() {
    this.cdcb = new CDCB();
    const init = () => {
      try {
        this.account = this.readAccountSync();
        if (this.account.username && this.account.password) {
          this.fetchAccount(this.account.username, this.account.password).catch((err: unknown) => console.warn('Error Updating ADGA Info (non-fatal):', err));
        }
      } catch (err) {
        console.warn('Error Accessing Account (non-fatal):', err);
      }
    };
    if (safeStorage.isEncryptionAvailable()) {
      init();
    } else {
      app.once('ready', () => init());
    }
  }
  change() {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('adga:change'));
  }
}
