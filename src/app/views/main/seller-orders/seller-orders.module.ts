import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { SellerOrdersComponent } from './seller-orders.component';
import { CurrencyModule } from 'src/app/pipes/currency.module';
import {NgxPaginationModule} from 'ngx-pagination';
import { HapproxyModule } from 'src/app/pipes/happroxy.module';
import { DateModule } from 'src/app/pipes/date.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SellerOrdersComponent
      }
    ]),
    HapproxyModule,
    MainNavComponentModule,
    CurrencyModule,
    DateModule,
    BsDatepickerModule.forRoot(),
    NgxPaginationModule
  ],
  declarations: [SellerOrdersComponent],
  exports: [RouterModule]
})
export class SellerOrdersComponentModule { }
