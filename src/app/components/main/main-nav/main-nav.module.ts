import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainNavComponent } from './main-nav.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [MainNavComponent],
  exports: [MainNavComponent]
})
export class MainNavComponentModule { }
