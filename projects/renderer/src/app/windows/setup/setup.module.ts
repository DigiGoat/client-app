import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';


@NgModule({
  declarations: [
    SetupComponent
  ],
  imports: [
    CommonModule,
    SetupRoutingModule,
    FormsModule
  ]
})
export class SetupModule { }
