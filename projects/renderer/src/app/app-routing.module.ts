import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { mainGuard } from './windows/main/main.guard';

const routes: Routes = [
  { path: '', redirectTo: '/main/home', pathMatch: 'full' },
  { path: 'main', canActivate: [mainGuard], loadChildren: () => import('./windows/main/main.module').then(m => m.MainModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
