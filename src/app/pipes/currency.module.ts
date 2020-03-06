import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from './currency';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CurrencyPipe],
  exports: [CurrencyPipe]
})
export class CurrencyModule { }
