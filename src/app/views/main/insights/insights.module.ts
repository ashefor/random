import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { BuyerComponent } from './buyer/buyer.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';
import { SellerComponent } from './seller/seller.component';

const routes: Routes = [
  { path: 'buyer', component: BuyerComponent },
  { path: 'manufacturer', component: ManufacturerComponent },
  { path: 'seller', component: SellerComponent },
];

@NgModule({
  declarations: [BuyerComponent, ManufacturerComponent, SellerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  exports: [RouterModule]
})
export class InsightsComponentModule { }
