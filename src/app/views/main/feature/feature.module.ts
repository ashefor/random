import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyModule } from 'src/app/pipes/currency.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { FeatureComponent } from './feature.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: FeatureComponent }
    ]),
    FormsModule,
    MainNavComponentModule,
    HttpClientModule,
    CurrencyModule,
    NgxPaginationModule
  ],
  declarations: [FeatureComponent],
  exports: [RouterModule]
})
export class FeatureComponentModule { }
