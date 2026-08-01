import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ɵɵDir } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { BuckComponent } from './buck/buck.component';
import { DoeComponent } from './doe/doe.component';
import { CaseInputComponent } from './elements/case-input/case-input.component';
import { GoatComponent } from './elements/goat/goat.component';
import { ForSaleComponent } from './for-sale/for-sale.component';
import { GoatRoutingModule } from './goat-routing.module';
import { ReferenceComponent } from './reference/reference.component';
import { RelatedComponent } from './related/related.component';


@NgModule({
  declarations: [
    DoeComponent,
    GoatComponent,
    BuckComponent,
    CaseInputComponent,
    RelatedComponent,
    ReferenceComponent,
    ForSaleComponent
  ],
  imports: [
    CommonModule,
    GoatRoutingModule,
    DirectivesModule,
    PipesModule,
    FormsModule,
    FormField,
    ɵɵDir
  ]
})
export class GoatModule { }
