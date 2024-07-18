import { Directive, HostBinding, HostListener, Input, booleanAttribute } from '@angular/core';

@Directive({
  selector: '[advanced]'
})
export class AdvancedDirective {
  @Input({ transform: booleanAttribute }) advanced: boolean = true;
  constructor() { }
  @HostBinding('style.display') get display() {
    return (this.show ?? !this.advanced) ? 'inline' : 'none';
  }

  show?: boolean;
  @HostListener('document:keydown', ['$event']) handleKeydownEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.show = this.advanced;
    }
  }
  @HostListener('document:keyup', ['$event']) handleKeyupEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.show = !this.advanced;
    }
  }
  //If the window looses focus, hide the advanced options
  @HostListener('window:blur', ['$event']) handleFocusEvent() {
    this.show = !this.advanced;
  }
}
