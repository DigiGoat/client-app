import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuckComponent } from './buck/buck.component';
import { DoeComponent } from './doe/doe.component';
import { ForSaleComponent } from './for-sale/for-sale.component';
import { ReferenceComponent } from './reference/reference.component';
import { RelatedComponent } from './related/related.component';

const routes: Routes = [
  { path: 'doe/:goat', component: DoeComponent },
  { path: 'buck/:goat', component: BuckComponent },
  { path: 'reference/:goat', component: ReferenceComponent },
  { path: 'for-sale/:goat', component: ForSaleComponent },
  { path: 'related/:goat', component: RelatedComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoatRoutingModule { }
