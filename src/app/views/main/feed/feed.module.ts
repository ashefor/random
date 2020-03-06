import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxViewerModule } from 'ngx-viewer';
import { FeedComponent } from './feed.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: FeedComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule,
    NgxViewerModule
  ],
  declarations: [FeedComponent],
  exports: [RouterModule]
})
export class FeedComponentModule { }
