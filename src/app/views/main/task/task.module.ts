import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { TaskComponent } from './task.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxViewerModule } from 'ngx-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: TaskComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule,
    NgxViewerModule
  ],
  declarations: [TaskComponent],
  exports: [RouterModule]
})
export class TaskComponentModule { }
