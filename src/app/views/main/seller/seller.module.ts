import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { SellerComponent } from './seller.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { SingleSellerComponent } from './single-seller/single-seller.component';
import { DateModule } from 'src/app/pipes/date.module';
import { CurrencyModule } from 'src/app/pipes/currency.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DateModule,
    CurrencyModule,
    RouterModule.forChild([
      {
        path: '',
        component: SellerComponent
      },
      {
        path: 'details/:id',
        component: SingleSellerComponent
      }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [SellerComponent, SingleSellerComponent],
  exports: [RouterModule]
})
export class SellerComponentModule { }
