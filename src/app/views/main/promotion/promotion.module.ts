import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { PromotionComponent } from './promotion.component';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: PromotionComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [PromotionComponent],
  exports: [RouterModule]
})
export class PromotionComponentModule { }
