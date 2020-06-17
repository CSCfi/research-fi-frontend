import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SecondaryButtonComponent } from './secondary-button/secondary-button.component';



@NgModule({
  declarations: [InfoComponent, SecondaryButtonComponent],
  exports: [
    InfoComponent,
    SecondaryButtonComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class CommonComponentsModule { }
