import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';
import { NavModule } from 'src/app/components/prologue/nav/nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: LandingComponent
      }
    ]),
    NavModule
  ],
  declarations: [LandingComponent],
  exports: [RouterModule]
})
export class LandingComponentModule { }
