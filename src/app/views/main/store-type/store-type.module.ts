import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { HttpClientModule } from '@angular/common/http';
import { StoreTypeComponent } from './store-type.component';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: StoreTypeComponent }
    ]),
    FormsModule,
    MainNavComponentModule,
    HttpClientModule,
    NgxPaginationModule
  ],
  declarations: [StoreTypeComponent],
  exports: [RouterModule]
})
export class StoreTypeComponentModule { }
