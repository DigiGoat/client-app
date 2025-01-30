import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-case-input',
  templateUrl: './case-input.component.html',
  styleUrl: './case-input.component.scss',
  standalone: false
})
export class CaseInputComponent {
  @Input() value?: string;
  @Output() valueChange = new EventEmitter<string>();
  invertCase(index: number): void {
    const char = this.value![index];
    const newChar = char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    this.value = this.value!.slice(0, index) + newChar + this.value!.slice(index + 1);
    this.valueChange.emit(this.value);
  }
}
