import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { BuyerComponent } from './buyer.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { SingleBuyerComponent } from './single-buyer/single-buyer.component';
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
        component: BuyerComponent
      },
      {
        path: 'details/:id',
        component: SingleBuyerComponent
      }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [BuyerComponent, SingleBuyerComponent],
  exports: [RouterModule]
})
export class BuyerComponentModule { }
