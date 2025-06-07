import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { ImageRoutingModule } from './image-routing.module';
import { ImageComponent } from './image.component';
import { OptimizeComponent } from './optimize/optimize.component';


@NgModule({
  declarations: [
    ImageComponent,
    OptimizeComponent
  ],
  imports: [
    CommonModule,
    ImageRoutingModule,
    DirectivesModule,
    FormsModule,
    DragDropModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class ImageModule { }
