import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { BuckComponent } from './buck/buck.component';
import { DoeComponent } from './doe/doe.component';
import { CaseInputComponent } from './elements/case-input/case-input.component';
import { GoatComponent } from './elements/goat/goat.component';
import { GoatRoutingModule } from './goat-routing.module';
import { RelatedComponent } from './related/related.component';
import { ReferenceComponent } from './reference/reference.component';


@NgModule({
  declarations: [
    DoeComponent,
    GoatComponent,
    BuckComponent,
    CaseInputComponent,
    RelatedComponent,
    ReferenceComponent
  ],
  imports: [
    CommonModule,
    GoatRoutingModule,
    DirectivesModule,
    PipesModule,
    FormsModule
  ]
})
export class GoatModule { }
