import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './notifications.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: NotificationsComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule
  ],
  exports: [RouterModule]
})
export class NotificationsComponentModule { }
