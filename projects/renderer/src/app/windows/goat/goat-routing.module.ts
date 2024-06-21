import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuckComponent } from './buck/buck.component';
import { DoeComponent } from './doe/doe.component';

const routes: Routes = [
  { path: 'doe/:goat', component: DoeComponent },
  { path: 'buck/:goat', component: BuckComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoatRoutingModule { }
