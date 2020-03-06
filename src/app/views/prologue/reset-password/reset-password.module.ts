import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';
import { SignupComponent } from '../signup/signup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: ResetPasswordComponent }
    ])
  ],
  declarations: [ResetPasswordComponent],
  exports: [RouterModule]
})
export class ResetPasswordComponentModule { }
