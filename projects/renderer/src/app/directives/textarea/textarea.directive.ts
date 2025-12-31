import { Directive, ElementRef, HostBinding, HostListener, type AfterViewChecked } from '@angular/core';

@Directive({
  selector: 'textarea',
  standalone: false
})
export class TextareaDirective implements AfterViewChecked {
  @HostBinding('style.resize') resize = 'none';
  @HostBinding('style.overflow-y') overflowY = 'hidden';
  @HostBinding('style.word-wrap') wordWrap = 'break-word';
  @HostListener('input') onInput() {
    this.adjust();
  }
  @HostListener('window:resize') onResize() {
    this.adjust();
  }
  constructor(private el: ElementRef<HTMLTextAreaElement>) {
  }
  ngAfterViewChecked() {
    this.adjust();
  }
  adjust() {
    //this.el.nativeElement.style.height = 'auto';
    //this.el.nativeElement.style.height = `${this.el.nativeElement.scrollHeight}px`;
    this.el.nativeElement.style.height = (this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight) ? (this.el.nativeElement.scrollHeight) + 'px' : 'auto';
  }
}
