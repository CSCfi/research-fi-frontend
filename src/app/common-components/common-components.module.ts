import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SecondaryButtonComponent } from './secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from './primary-action-button/primary-action-button.component';



@NgModule({
  declarations: [InfoComponent, SecondaryButtonComponent, PrimaryActionButtonComponent],
  exports: [
    InfoComponent,
    SecondaryButtonComponent,
    PrimaryActionButtonComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class CommonComponentsModule { }
