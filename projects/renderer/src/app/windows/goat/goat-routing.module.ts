import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoeComponent } from './doe/doe.component';

const routes: Routes = [{
  path: 'doe/:goat', component: DoeComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoatRoutingModule { }
