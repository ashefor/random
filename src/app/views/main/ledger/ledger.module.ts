import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { HttpClientModule } from '@angular/common/http';
import {NgxPaginationModule} from 'ngx-pagination';
import { LedgerComponent } from './ledger.component';
import { CurrencyModule } from 'src/app/pipes/currency.module';
import { DateModule } from 'src/app/pipes/date.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: LedgerComponent }
    ]),
    FormsModule,
    MainNavComponentModule,
    HttpClientModule,
    DateModule,
    NgxPaginationModule,
    CurrencyModule
  ],
  declarations: [LedgerComponent],
  exports: [RouterModule]
})
export class LedgerComponentModule { }
