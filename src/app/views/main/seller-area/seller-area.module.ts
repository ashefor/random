import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SellerAreaComponent } from './seller-area.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: SellerAreaComponent
      }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [SellerAreaComponent],
  exports: [RouterModule]
})
export class SellerAreaComponentModule { }
