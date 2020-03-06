import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { BillingComponent } from './billing/billing.component';
import { BuyersComponent } from './buyers/buyers.component';
import { ManufacturersComponent } from './manufacturers/manufacturers.component';
import { SellersComponent } from './sellers/sellers.component';
import { SupliasComponent } from './suplias/suplias.component';
import { ThirdPartyComponent } from './third-party/third-party.component';
import { BillingInstructionsComponent } from './billing-instructions/billing-instructions.component';
import { CurrencyModule } from 'src/app/pipes/currency.module';

const routes: Routes = [
  { path: '', redirectTo: '/main/finances/billing', pathMatch: 'full' },
  { path: 'billing', component: BillingComponent },
  { path: 'buyers', component: BuyersComponent },
  { path: 'manufacturers', component: ManufacturersComponent },
  { path: 'sellers', component: SellersComponent },
  { path: 'suplias', component: SupliasComponent },
  { path: 'third-party', component: ThirdPartyComponent },
  { path: 'billing/instructions/:billing_id', component: BillingInstructionsComponent },
];

@NgModule({
  declarations: [BillingComponent, BuyersComponent, ManufacturersComponent, SellersComponent, SupliasComponent, ThirdPartyComponent,
    BillingInstructionsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CurrencyModule,
    MainNavComponentModule,
    NgxPaginationModule
  ],
  exports: [RouterModule]
})
export class FinancesComponentModule { }
