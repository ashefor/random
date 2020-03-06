import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsComponent } from './tickets.component';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { DateModule } from 'src/app/pipes/date.module';
import { NgxPaginationModule } from 'ngx-pagination';



@NgModule({
  declarations: [TicketsComponent],
  imports: [
    CommonModule,
    MainNavComponentModule,
    DateModule,
    NgxPaginationModule,
    RouterModule.forChild([
      {
        path: '', component: TicketsComponent
      }
    ])
  ]
})
export class TicketsModule { }
