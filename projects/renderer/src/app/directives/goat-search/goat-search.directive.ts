import { Directive, ElementRef, Input, type OnDestroy, type OnInit } from '@angular/core';
import type { Dropdown } from 'bootstrap';
import type { Goat } from '../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../services/goat/goat.service';

@Directive({
  selector: 'input[goat-search]',
  standalone: false
})
export class GoatSearchDirective implements OnInit, OnDestroy {

  private document = this.el.nativeElement.ownerDocument;
  private list = this.document.createElement('ul');
  private input = this.el.nativeElement;
  private dropdown?: Dropdown;
  private inputHandler?: () => void;
  private focusHandler?: () => void;
  private blurHandler?: () => void;
  @Input({ alias: 'goat-search' }) goats?: Goat[] | 'does' | 'bucks';
  constructor(private el: ElementRef<HTMLInputElement>, private goatService: GoatService) { }
  async ngOnInit() {
    this.input.setAttribute('data-bs-toggle', 'dropdown');
    this.input.classList.add('dropdown-toggle');
    this.list.classList.add('dropdown-menu');
    this.list.style.maxHeight = '200px';
    this.list.style.overflowY = 'scroll';
    this.input.insertAdjacentElement('beforebegin', this.list);

    this.dropdown = bootstrap.Dropdown.getOrCreateInstance(this.input);

    this.inputHandler = () => this.updateList();
    this.focusHandler = () => this.updateList();
    this.blurHandler = () => this.dropdown?.hide();
    this.input.addEventListener('input', this.inputHandler);
    this.input.addEventListener('focus', this.focusHandler);
    this.input.addEventListener('blur', this.blurHandler);
  }
  async updateList() {
    this.list.innerHTML = '';
    if (this.goats === 'does') {
      this.goats = [];
      await Promise.all([(async () => (this.goats as Goat[]).push(...await this.goatService.getDoes()))(), (async () => (this.goats as Goat[]).push(...(await this.goatService.getReferences()).filter(goat => goat.sex === 'Female')))()]);
    } else if (this.goats === 'bucks') {
      this.goats = [];
      await Promise.all([(async () => (this.goats as Goat[]).push(...await this.goatService.getBucks()))(), (async () => (this.goats as Goat[]).push(...(await this.goatService.getReferences()).filter(goat => goat.sex === 'Male')))()]);
    }
    if (this.goats?.length) {
      const matches = this.goats.filter(doe => doe.normalizeId?.toLowerCase().includes(this.input.value.toLowerCase()));
      matches.push(...this.goats.filter(doe => doe.name?.toLowerCase().includes(this.input.value.toLowerCase())).filter(goat => !matches.includes(goat)));
      for (const match of matches) {
        const item = this.document.createElement('li');
        const button = this.document.createElement('button');
        button.classList.add('dropdown-item', 'color-scheme-quaternary');
        button.addEventListener('mousedown', () => {
          this.input.value = match.normalizeId ?? '';
          this.input.dispatchEvent(new Event('input'));
        });

        const name = this.document.createElement('div');
        name.classList.add('fw-semibold', 'text-wrap');
        name.innerHTML = match.name?.replace(new RegExp(`(${this.input.value})`, 'ig'), '<span class="text-info">$1</span>') ?? '';

        const id = this.document.createElement('div');
        id.classList.add('fw-light');
        id.innerHTML = match.normalizeId?.replace(new RegExp(`(${this.input.value})`, 'ig'), '<span class="text-info">$1</span>') ?? '';

        button.appendChild(name);
        button.appendChild(id);
        item.appendChild(button);
        /*
        <button class="dropdown-item color-scheme-quaternary" (click)="goatSelected.emit(goat)">
        <div class='fw-semibold text-wrap' [innerHTML]="formatGoat(goat, search.value).name"></div>
        <div class='fw-light'>{{goat.normalizeId}}</div>
      </button>

              item.textContent = match.name ?? '';
        item.classList.add('dropdown-item');

        */
        this.list.appendChild(item);
      }
    }
  }

  ngOnDestroy(): void {
    // Dispose of Bootstrap Dropdown instance to prevent memory leaks and race conditions
    this.dropdown?.dispose();

    // Remove event listeners to prevent memory leaks
    if (this.inputHandler) {
      this.input.removeEventListener('input', this.inputHandler);
    }
    if (this.focusHandler) {
      this.input.removeEventListener('focus', this.focusHandler);
    }
    if (this.blurHandler) {
      this.input.removeEventListener('blur', this.blurHandler);
    }

    // Remove dynamically created DOM elements
    this.list.remove();
  }
}
