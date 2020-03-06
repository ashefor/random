import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { CurrencyModule } from 'src/app/pipes/currency.module';
import { ChartsModule } from 'angular-bootstrap-md';
import { HapproxyModule } from 'src/app/pipes/happroxy.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent
      }
    ]),
    MainNavComponentModule,
    CurrencyModule,
    HapproxyModule,
    ChartsModule
  ],
  declarations: [DashboardComponent],
  exports: [RouterModule]
})
export class DashboardComponentModule { }
