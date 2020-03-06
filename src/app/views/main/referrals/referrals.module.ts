import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { ReferralsComponent } from './referrals.component';
import { HapproxyModule } from 'src/app/pipes/happroxy.module';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: ReferralsComponent }
    ]),
    HapproxyModule,
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [ReferralsComponent],
  exports: [RouterModule]
})
export class ReferralComponentModule { }
