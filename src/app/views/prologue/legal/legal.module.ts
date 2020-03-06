import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavModule } from 'src/app/components/prologue/nav/nav.module';
import { LegalComponent } from './legal.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: LegalComponent
      }
    ]),
    NavModule
  ],
  declarations: [LegalComponent],
  exports: [RouterModule]
})
export class LegalComponentModule { }
