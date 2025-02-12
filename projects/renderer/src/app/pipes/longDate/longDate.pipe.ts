import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longDate',
  standalone: false
})
export class LongDatePipe implements PipeTransform {

  transform(value?: string | null): string {
    if (!value || !Date.parse(value)) {
      return value ?? '';
    } else {
      const datePipe = new DatePipe('en-US');
      return datePipe.transform(value, 'longDate') ?? '';
    }
  }

}
