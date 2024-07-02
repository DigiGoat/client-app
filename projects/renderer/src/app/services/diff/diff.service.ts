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
    const updated = Object.keys(diff.updated);
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
}
