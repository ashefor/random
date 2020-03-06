import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { SurveyComponent } from './survey.component';
import { NgxViewerModule } from 'ngx-viewer';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: SurveyComponent }
    ]),
    FormsModule,
    MainNavComponentModule,
    HttpClientModule,
    NgxPaginationModule,
    NgxViewerModule
  ],
  declarations: [SurveyComponent],
  exports: [RouterModule]
})
export class SurveyComponentModule { }
