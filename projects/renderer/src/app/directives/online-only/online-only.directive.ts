import { Directive, ElementRef, HostListener, type OnInit } from '@angular/core';

@Directive({
  selector: '[online-only]'
})
export class OnlineOnlyDirective implements OnInit {
  @HostListener('window:offline') onOffline() {
    this.disabled = true;
    if (this.el.nativeElement.classList.contains('show')) {
      this.el.nativeElement.click();
    }
  }
  @HostListener('window:online') onOnline() {
    this.disabled = false;
  }
  constructor(private el: ElementRef<HTMLButtonElement>) { }
  ngOnInit() {
    this.disabled = !navigator.onLine;
  }
  set disabled(disabled: boolean) {
    this.el.nativeElement.disabled = disabled;
    if (disabled) {
      this.el.nativeElement.classList.add('disabled');
    } else {
      this.el.nativeElement.classList.remove('disabled');
    }
  }
}
