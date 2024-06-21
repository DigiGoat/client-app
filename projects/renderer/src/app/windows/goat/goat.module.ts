import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { DoeComponent } from './doe/doe.component';
import { GoatComponent } from './elements/goat/goat.component';
import { GoatRoutingModule } from './goat-routing.module';
import { BuckComponent } from './buck/buck.component';


@NgModule({
  declarations: [
    DoeComponent,
    GoatComponent,
    BuckComponent
  ],
  imports: [
    CommonModule,
    GoatRoutingModule,
    DirectivesModule,
    FormsModule
  ]
})
export class GoatModule { }
