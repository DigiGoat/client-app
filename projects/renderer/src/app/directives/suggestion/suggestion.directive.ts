import { Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[suggestion], textarea[suggestion]'
})
export class SuggestionDirective {
  /** What to display as a placeholder and autofill if selected */
  @Input() suggestion!: string;
  @HostBinding('placeholder') get placeholder() {
    return this.suggestion;
  }
  @HostListener('focus') onFocus() {
    if (!this.el.nativeElement.value.length) {
      this.el.nativeElement.value = this.suggestion;
      this.el.nativeElement.dispatchEvent(new Event('input'));
    }
  }
  constructor(private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>) { }
}
