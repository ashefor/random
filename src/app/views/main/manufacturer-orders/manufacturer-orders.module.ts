import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { ManufacturerOrdersComponent } from './manufacturer-orders.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ManufacturerOrdersComponent }
    ]),
    MainNavComponentModule
  ],
  declarations: [ManufacturerOrdersComponent],
  exports: [RouterModule]
})
export class ManufacturerOrdersComponentModule { }
