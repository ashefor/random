import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders.component';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { DateModule } from 'src/app/pipes/date.module';
import { OrderItemComponent } from './order-item/order-item.component';
import { CurrencyModule } from 'src/app/pipes/currency.module';



@NgModule({
  declarations: [OrdersComponent, OrderItemComponent],
  imports: [
    CommonModule,
    MainNavComponentModule,
    NgxPaginationModule,
    DateModule,
    CurrencyModule,
    RouterModule.forChild([
      {
        path: '', component: OrdersComponent
      },
      {
        path: 'item/:id', component: OrderItemComponent
      }
    ])
  ]
})
export class OrdersModule { }
