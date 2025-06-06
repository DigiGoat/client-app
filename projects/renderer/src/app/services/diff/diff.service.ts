import { Injectable } from '@angular/core';
import { addedDiff, deletedDiff, detailedDiff, diff, updatedDiff } from 'deep-object-diff';

@Injectable({
  providedIn: 'root'
})
export class DiffService {

  constructor() { }
  diff = diff;
  addedDiff = addedDiff;
  deletedDiff = deletedDiff;
  updatedDiff = updatedDiff;
  detailedDiff = detailedDiff;
  spaces = '      ';
  /* -------------------- Message Parsing -------------------- */
  commitMsg(original: Record<string, unknown>, current: Record<string, unknown>) {
    const diff = this.detailedDiff(original, current);
    const added = Object.keys(diff.added);
    const deleted = Object.keys(diff.deleted);
    const updated = Object.keys(diff.updated ?? {});
    const body: string[] = [];
    for (const addition of added) {
      if (typeof current[addition] !== 'object') {
        body.push(`Set ${this.prettyCase(addition)} To ${JSON.stringify(current[addition] as string)}`);
      } else {
        body.push(`Added ${this.prettyCase(addition)}`, ...this.commitMsg({}, current[addition] as Record<string, unknown>).map(line => `${this.spaces}${line}`));
      }
    }

    for (const deletion of deleted) {
      body.push(`Deleted ${this.prettyCase(deletion)}`);
    }
    for (const update of updated) {
      if (typeof current[update] !== 'object') {
        if (current[update] && original[update]) {
          body.push(`Updated ${this.prettyCase(update)} From ${JSON.stringify(original[update] as string)} To ${JSON.stringify(current[update] as string)}`);
        } else if (current[update]) {
          body.push(`Set ${this.prettyCase(update)} To ${JSON.stringify(current[update] as string)}`);
        } else {
          body.push(`Deleted ${this.prettyCase(update)}`);
        }
      } else {
        body.push(`Updated ${this.prettyCase(update)}`, ...this.commitMsg(original[update] as Record<string, unknown>, current[update] as Record<string, unknown>).map(line => `${this.spaces}${line}`));
      }
    }
    return body;
  }
  private prettyCase(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
  }

  private overrides = {
    'w': 'w',
    'sgch': 'SGCH',
    'dhrv': 'DHRV',
    'imax': 'IMAX',
    'be': 'Be',
    'in': 'In',
    'me': 'Me',
    'mr': 'Mr',
    'my': 'My',
    'oh': 'Oh',
    'on': 'On',
    'go': 'Go',
    'of': 'Of',
    'gch': 'GCH',
    'moondustmayhem': 'MoondustMayhem',
    'sophisticatedlady': 'SophisticatedLady',
    'belleoftheball': 'BelleOfTheBall',
    'ilm': 'ILM',
    'kissfroma': 'KissFromA',
    'setfiretothe': 'SetFireToThe',
    'tua': 'TUA',
    'ofthe': 'OfThe',
    'wtm': 'WTM',
    'cto': 'CTO',
    'ya': 'Ya',
    'an': 'An',
    'bydesign': 'ByDesign',
    'frb': 'FRB',
    'jdi': 'JDI',
    'rmi': 'RMI',
    'ats': 'ATS',
    'ags': 'AGS',
    'risesupfromtheash': 'RisesUpFromTheAsh',
    '8sr': '8SR',
    'likea': 'LikeA',
    'famfarm': 'FamFarm',
    'ilenesrascals': 'IlenesRascals',
    'teachmesomethin\'': 'TeachMeSomethin\'',
    'justn\'smoke': 'Justn\'Smoke',
  };

  private parseCase(word: string) {
    word = word.toLowerCase();
    if (this.overrides[word as keyof typeof this.overrides]) {
      return this.overrides[word as keyof typeof this.overrides];
    } else if (word.length < 3) {
      return word.toUpperCase();
    } else {
      return word.replace(word[0], word[0].toUpperCase());
    }
  }
  titleCase(str: string) {
    const dividers = /([^a-zA-Z])/;
    const parts = str.split(dividers);
    for (let i = 0; i < parts.length; i += 2) {
      parts[i] = this.parseCase(parts[i]);
    }
    return parts.join('');
  }
  softMerge<T extends Record<string, unknown>>(obj1: Partial<T>, obj2: Partial<T>): Partial<T> {
    obj1 = structuredClone(obj1 ?? {});
    obj2 = structuredClone(obj2 ?? {});
    const obj3 = obj1;
    for (const key in obj2) {
      if (typeof obj2[key] === 'string' && (obj2[key] as string | never)?.toLowerCase() === (obj1[key] as string | never)?.toLowerCase()) {
        continue;
      } else if (typeof obj2[key] === 'object' && obj2[key] !== null) {
        obj3[key] = this.softMerge(obj1[key] ?? {}, obj2[key] ?? {}) as T[Extract<keyof T, string>];
      } else {
        obj3[key] = obj2[key];
      }
    }
    return obj3;
  }
}
