import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponentModule } from 'src/app/components/main/main-nav/main-nav.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AreaComponent } from './area.component';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    MainNavComponentModule,
    RouterModule.forChild([
      { path: '', component: AreaComponent }
    ]),
    FormsModule,
    NgxPaginationModule
  ],
  declarations: [AreaComponent],
  exports: [RouterModule]
})
export class AreaComponentModule { }
