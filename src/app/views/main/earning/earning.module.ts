import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EarningComponent } from './earning.component';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyModule } from 'src/app/pipes/currency.module';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: EarningComponent }
    ]),
    FormsModule,
    MainNavComponentModule,
    HttpClientModule,
    CurrencyModule,
    NgxPaginationModule
  ],
  declarations: [EarningComponent],
  exports: [RouterModule]
})
export class EarningComponentModule { }
