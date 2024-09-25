import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longDate'
})
export class LongDatePipe implements PipeTransform {

  transform(value?: string): string {
    if (!value || !Date.parse(value)) {
      return value ?? '';
    } else {
      const datePipe = new DatePipe('en-US');
      return datePipe.transform(value, 'longDate') ?? '';
    }
  }

}
