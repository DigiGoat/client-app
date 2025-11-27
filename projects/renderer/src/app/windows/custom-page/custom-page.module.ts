import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { CustomPageRoutingModule } from './custom-page-routing.module';
import { CustomPageComponent } from './custom-page.component';


@NgModule({
  declarations: [
    CustomPageComponent,
  ],
  imports: [
    CommonModule,
    CustomPageRoutingModule,
    DirectivesModule,
    FormsModule,
    DragDropModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class CustomPageModule { }
