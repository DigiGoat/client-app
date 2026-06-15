import { Directive, HostBinding, HostListener, Input, booleanAttribute, inject } from '@angular/core';
import { AppService } from '../../services/app/app.service';

@Directive({
  selector: '[advanced]',
  standalone: false
})
export class AdvancedDirective {
  private appService = inject(AppService);

  @Input({ transform: booleanAttribute }) advanced = true;
  @HostBinding('style.display') get display() {
    return (this.show ?? !this.advanced) ? 'inline' : 'none';
  }

  show?: boolean;
  @HostListener('document:keydown', ['$event']) handleKeydownEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.show = this.advanced;
    } else if (event.key === 'Shift' && !['input', 'textarea'].includes((event.target as unknown as { localName: string }).localName) && this.appService.platform !== 'darwin') {
      this.show = this.advanced;
    }
  }
  @HostListener('document:keyup', ['$event']) handleKeyupEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.show = !this.advanced;
    } else if (event.key === 'Shift' && !['input', 'textarea'].includes((event.target as unknown as { localName: string }).localName) && this.appService.platform !== 'darwin') {
      this.show = !this.advanced;
    }
  }
  //If the window looses focus, hide the advanced options
  @HostListener('window:blur') handleFocusEvent() {
    this.show = !this.advanced;
  }
}
