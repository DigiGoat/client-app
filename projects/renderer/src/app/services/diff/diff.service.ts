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
}
