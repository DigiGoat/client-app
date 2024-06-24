import { Directive, ElementRef, HostBinding, HostListener, Input, type OnInit } from '@angular/core';
import type { Tooltip } from 'bootstrap';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective implements OnInit {
  private bsTooltip?: Tooltip;
  @Input('tooltip-placement') placement: 'auto' | 'top' | 'bottom' | 'left' | 'right' = 'auto';
  @Input() set tooltip(value: string) {
    if (this.bsTooltip) {
      this.bsTooltip.setContent({ '.tooltip-inner': value });
    } else {
      this.el.nativeElement.setAttribute('data-bs-title', value);
    }
  }
  @HostBinding('data-bs-toggle') toggle = 'tooltip';
  @HostListener('click') onClick() {
    this.bsTooltip?.hide();
  }
  constructor(private el: ElementRef) { }
  ngOnInit(): void {
    this.bsTooltip = bootstrap.Tooltip.getOrCreateInstance(this.el.nativeElement, { placement: this.placement });
  }

}
