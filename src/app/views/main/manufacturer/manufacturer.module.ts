import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManufacturerComponent } from './manufacturer.component';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ManufacturerComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [ManufacturerComponent],
  exports: [RouterModule]
})
export class ManufacturerComponentModule { }
