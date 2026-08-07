import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormField } from '@angular/forms/signals';
import { DirectivesModule } from '../../directives/directives.module';
import { KiddingRoutingModule } from './kidding-routing.module';
import { KiddingComponent } from './kidding.component';
import { PipesModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    KiddingComponent
  ],
  imports: [
    CommonModule,
    KiddingRoutingModule,
    FormField,
    DirectivesModule,
    PipesModule
  ]
})
export class KiddingModule { }
