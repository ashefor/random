import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { SideMenuComponentModule } from 'src/app/components/main/side-menu/side-menu.module';
import { MainComponent } from './main.component';


@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    SideMenuComponentModule
  ]
})
export class MainComponentModule { }
