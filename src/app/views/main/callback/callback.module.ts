import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CallbackComponent } from './callback.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CallbackComponent}
    ])
  ],
  declarations: [CallbackComponent],
  exports: [RouterModule]
})
export class CallbackComponentModule { }
