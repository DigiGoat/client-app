import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GitGuard } from './guards/git/git.guard';
import { RepoGuard } from './guards/repo/repo.guard';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', canActivate: [GitGuard, RepoGuard], loadChildren: () => import('./windows/main/main.module').then(m => m.MainModule) },
  { path: 'setup', canActivate: [GitGuard], loadChildren: () => import('./windows/setup/setup.module').then(m => m.SetupModule) },
  { path: 'git', loadChildren: () => import('./windows/git/git.module').then(m => m.GitModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
