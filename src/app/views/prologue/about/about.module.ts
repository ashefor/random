import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './about.component';
import { NavModule } from 'src/app/components/prologue/nav/nav.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AboutComponent
      }
    ]),
    NavModule
  ],
  declarations: [AboutComponent],
  exports: [RouterModule]
})
export class AboutComponentModule { }
