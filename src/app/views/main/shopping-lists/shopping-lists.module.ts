import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingListsComponent } from './shopping-lists.component';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { DateModule } from 'src/app/pipes/date.module';
import { ShoppingListItemsComponent } from './shopping-list-items/shopping-list-items.component';
import { CurrencyModule } from 'src/app/pipes/currency.module';



@NgModule({
  declarations: [ShoppingListsComponent, ShoppingListItemsComponent],
  imports: [
    CommonModule,
    MainNavComponentModule,
    NgxPaginationModule,
    DateModule,
    CurrencyModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShoppingListsComponent
      },
      {
        path: 'item/:id',
        component: ShoppingListItemsComponent
      }
    ])
  ]
})
export class ShoppingListsModule { }
