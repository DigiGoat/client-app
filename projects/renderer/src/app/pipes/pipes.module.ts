import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LongDatePipe } from './longDate/longDate.pipe';



@NgModule({
  declarations: [
    LongDatePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LongDatePipe
  ]
})
export class PipesModule { }
