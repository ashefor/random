import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { ManagerComponent } from './manager.component';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ManagerComponent
      }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  declarations: [ManagerComponent],
  exports: [RouterModule]
})
export class ManagerComponentModule { }
