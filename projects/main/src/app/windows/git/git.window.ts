import { Window } from '../window';

export class GitWindow extends Window {
  constructor() {
    super({ resizable: false, width: 500, height: 250, title: 'Install Git' }, 'git');
  }
}
