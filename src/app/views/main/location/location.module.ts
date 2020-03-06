import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocationComponent } from './location.component';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { HttpClientModule } from '@angular/common/http';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: LocationComponent }
    ]),
    FormsModule,
    MainNavComponentModule,
    HttpClientModule,
    NgxPaginationModule
  ],
  declarations: [LocationComponent],
  exports: [RouterModule]
})
export class LocationComponentModule { }
