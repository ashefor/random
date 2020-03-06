import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HapproxyPipe } from './happroxy.pipe';

@NgModule({
  declarations: [HapproxyPipe],
  imports: [CommonModule],
  exports: [HapproxyPipe]
})
export class HapproxyModule { }
