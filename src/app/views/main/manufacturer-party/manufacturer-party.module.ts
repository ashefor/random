import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { ManufacturerPartyComponent } from './manufacturer-party.component';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ManufacturerPartyComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [ManufacturerPartyComponent],
  exports: [RouterModule]
})
export class ManufacturerPartyComponentModule { }
