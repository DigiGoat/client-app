import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepoGuard } from './guards/repo/repo.guard';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', canActivate: [RepoGuard], loadChildren: () => import('./windows/main/main.module').then(m => m.MainModule) },
  { path: 'setup', loadChildren: () => import('./windows/setup/setup.module').then(m => m.SetupModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
