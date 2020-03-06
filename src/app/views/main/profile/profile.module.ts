import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { ProfileComponent } from './profile.component';
import { DateModule } from 'src/app/pipes/date.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: ProfileComponent }
    ]),
    MainNavComponentModule,
    DateModule
  ],
  declarations: [ProfileComponent],
  exports: [RouterModule]
})
export class ProfileComponentModule { }
