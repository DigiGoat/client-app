import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StdioService {

  constructor() { }
  set onstdout(callback: (data: string) => void) {
    window.electron.stdio.onstdout(callback);
  }

  set onstderr(callback: (data: string) => void) {
    window.electron.stdio.onstderr(callback);
  }

  pipeConsole() {
    this.onstdout = (data) => console.log('>', data);
    this.onstderr = (data) => console.error('>', data);
  }
}
