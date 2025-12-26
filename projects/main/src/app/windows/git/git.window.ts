import { Window } from '../window';

export class GitWindow extends Window {
  constructor() {
    super('git', { resizable: false, width: 500, height: 250, title: 'Install Git' });
  }
}
