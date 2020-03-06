import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { TaskResponseComponent } from './task-response.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { NgxViewerModule } from 'ngx-viewer';
import { HapproxyModule } from 'src/app/pipes/happroxy.module';
import { DateModule } from 'src/app/pipes/date.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ChartsModule } from 'angular-bootstrap-md';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'responses/:id', component: TaskResponseComponent },
      { path: 'report/:id', component: TaskResponseComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule,
    NgxViewerModule,
    HapproxyModule,
    DateModule,
    BsDatepickerModule.forRoot(),
    ChartsModule
  ],
  declarations: [TaskResponseComponent],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TaskResponseComponentModule { }
