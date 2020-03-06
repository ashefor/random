import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', loadChildren: () => import('./views/prologue/landing/landing.module').then((m) => m.LandingComponentModule)},
  { path: 'login', loadChildren: () => import('./views/prologue/signup/signup.module').then((m) => m.SignupComponentModule) },
  { path: 'about', loadChildren: () => import('./views/prologue/about/about.module').then((m) => m.AboutComponentModule) },
  { path: 'legal', loadChildren: () => import('./views/prologue/legal/legal.module').then((m) => m.LegalComponentModule) },
  { path: 'contact', loadChildren: () => import('./views/prologue/contact/contact.module').then((m) => m.ContactComponentModule) },
  { path: 'reset-password', loadChildren: () => import('./views/prologue/reset-password/reset-password.module')
    .then((m) => m.ResetPasswordComponentModule) },
  { path: 'reset-password/:object', loadChildren: () => import('./views/prologue/verify-passcode/verify-passcode.module')
    .then((m) => m.VerifyPasscodeComponentModule)},
  { path: 'main', loadChildren: () => import('./views/main/main/main.module')
    .then((m) => m.MainComponentModule)}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
