import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VerifyPasscodeComponent } from './verify-passcode.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: VerifyPasscodeComponent }
    ])
  ],
  declarations: [VerifyPasscodeComponent],
  exports: [RouterModule]
})
export class VerifyPasscodeComponentModule { }
