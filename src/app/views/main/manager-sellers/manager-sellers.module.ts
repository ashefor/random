import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { ManagerSellersComponent } from './manager-sellers.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ManagerSellersComponent
      }
    ]),
    MainNavComponentModule
  ],
  declarations: [ManagerSellersComponent],
  exports: [RouterModule]
})
export class ManagerSellersComponentModule { }
