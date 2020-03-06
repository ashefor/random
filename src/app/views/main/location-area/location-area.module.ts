import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { HttpClientModule } from '@angular/common/http';
import { LocationAreaComponent } from './location-area.component';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: LocationAreaComponent }
    ]),
    FormsModule,
    MainNavComponentModule,
    HttpClientModule,
    NgxPaginationModule
  ],
  declarations: [LocationAreaComponent],
  exports: [RouterModule]
})
export class LocationAreaComponentModule { }
