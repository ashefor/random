import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { RouterModule } from '@angular/router';
import { BrandComponent } from './brand.component';
import { FormsModule } from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    MainNavComponentModule,
    RouterModule.forChild([
      { path: '', component: BrandComponent }
    ]),
    FormsModule,
    NgxPaginationModule
  ],
  declarations: [BrandComponent],
  exports: [RouterModule]
})
export class BrandComponentModule { }
