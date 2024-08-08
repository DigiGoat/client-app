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
        body.push(`Added ${this.prettyCase(addition)}`);
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
        body.push(`Updated ${this.prettyCase(update)}`);
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
    str = str.toLowerCase();
    str = str.split(' ').map(str => str.split(',').map(_str => _str.split('/').map(__str => __str.split('-').map(___str => ___str.split('.').map(word => this.parseCase(word)).join('.')).join('-')).join('/')).join(',')).join(' ');
    return str;
  }
  softMerge<T extends Record<string, unknown>>(obj1: Partial<T>, obj2: Partial<T>): Partial<T> {
    const obj3 = obj1;
    for (const key in obj2) {
      if (typeof obj2[key] === 'string' && (obj2[key] as string | never)?.toLowerCase() === (obj1[key] as string | never)?.toLowerCase()) {
        continue;
      } else {
        obj3[key] = obj2[key];
      }
    }
    return obj3;
  }
}
