import { Directive, HostBinding, HostListener, Input, booleanAttribute } from '@angular/core';
import { AppService } from '../../services/app/app.service';

@Directive({
  selector: '[advanced]'
})
export class AdvancedDirective {
  @Input({ transform: booleanAttribute }) advanced: boolean = true;
  constructor(private appService: AppService) { }
  @HostBinding('style.display') get display() {
    return (this.show ?? !this.advanced) ? 'inline' : 'none';
  }

  show?: boolean;
  @HostListener('document:keydown', ['$event']) handleKeydownEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.show = this.advanced;
    } else if (event.key === 'Shift' && !['input', 'textarea'].includes((event.target as unknown as { localName: string; }).localName) && this.appService.platform !== 'darwin') {
      this.show = this.advanced;
    }
  }
  @HostListener('document:keyup', ['$event']) handleKeyupEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.show = !this.advanced;
    } else if (event.key === 'Shift' && !['input', 'textarea'].includes((event.target as unknown as { localName: string; }).localName) && this.appService.platform !== 'darwin') {
      this.show = !this.advanced;
    }
  }
  //If the window looses focus, hide the advanced options
  @HostListener('window:blur', ['$event']) handleFocusEvent() {
    this.show = !this.advanced;
  }
}
