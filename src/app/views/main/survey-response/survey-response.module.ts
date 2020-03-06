import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SurveyResponseComponent } from './survey-response.component';
import { HapproxyModule } from 'src/app/pipes/happroxy.module';
import { NgxViewerModule } from 'ngx-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: SurveyResponseComponent }
    ]),
    MainNavComponentModule,
    NgxPaginationModule,
    HapproxyModule,
    NgxViewerModule
  ],
  declarations: [SurveyResponseComponent],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SurveyResponseComponentModule { }
