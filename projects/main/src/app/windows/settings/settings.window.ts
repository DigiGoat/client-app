import { Window } from '../window';

export class SettingsWindow extends Window {
  constructor() {
    super('settings', { minWidth: 600, minHeight: 450, width: 800, height: 600, title: 'Settings', fullscreen: false });
  }
}
