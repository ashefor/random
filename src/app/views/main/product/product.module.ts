import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductComponent } from './product.component';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { CurrencyModule } from 'src/app/pipes/currency.module';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: ProductComponent }
    ]),
    MainNavComponentModule,
    CurrencyModule,
    NgxPaginationModule
  ],
  declarations: [ProductComponent],
  exports: [RouterModule]
})
export class ProductComponentModule { }
