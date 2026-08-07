import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormField } from '@angular/forms/signals';
import { DirectivesModule } from '../../directives/directives.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';


@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    DirectivesModule,
    FormField
  ]
})
export class SettingsModule { }
