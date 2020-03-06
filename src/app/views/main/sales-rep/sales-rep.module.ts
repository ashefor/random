import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { SalesRepComponent } from './sales-rep.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { SingleSalesRepComponent } from './single-sales-rep/single-sales-rep.component';
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
        component: SalesRepComponent
      },
      {
        path: 'details/:id',
        component: SingleSalesRepComponent
      }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [SalesRepComponent, SingleSalesRepComponent],
  exports: [RouterModule]
})
export class SalesRepComponentModule { }
