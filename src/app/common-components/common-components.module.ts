import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@NgModule({
  declarations: [InfoComponent],
  exports: [
    InfoComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class CommonComponentsModule { }
