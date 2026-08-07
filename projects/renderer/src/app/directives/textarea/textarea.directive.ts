import { Directive, ElementRef, HostBinding, HostListener, inject } from '@angular/core';

@Directive({
  selector: 'textarea',
  standalone: false,
})
export class TextareaDirective {
  private el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  @HostBinding('style.resize') resize = 'none';
  @HostBinding('style.overflow-y') overflowY = 'hidden';
  @HostBinding('style.word-wrap') wordWrap = 'break-word';
  @HostListener('window:resize') onResize() {
    this.adjust();
  }
  @HostListener('input') onInput() {
    this.adjust();
  }
  @HostListener('focus') onFocus() {
    this.adjust();
  }
  @HostListener('blur') onBlur() {
    this.adjust();
  }
  adjust() {
    if (this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight) {
      this.el.nativeElement.style.height = (this.el.nativeElement.scrollHeight) + 'px';
    } else if (this.el.nativeElement.ownerDocument.activeElement !== this.el.nativeElement) {
      this.el.nativeElement.style.height = 'auto';
      this.el.nativeElement.style.height = `${this.el.nativeElement.scrollHeight}px`;
    }
  }
}
