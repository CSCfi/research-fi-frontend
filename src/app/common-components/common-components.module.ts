import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SecondaryButtonComponent } from './secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from './primary-action-button/primary-action-button.component';
import { CloseButtonComponent } from './close-button/close-button.component';
import { NotFoundComponent } from './not-found/not-found.component';



@NgModule({
  declarations: [InfoComponent, SecondaryButtonComponent, PrimaryActionButtonComponent, CloseButtonComponent, NotFoundComponent],
  exports: [
    InfoComponent,
    SecondaryButtonComponent,
    PrimaryActionButtonComponent,
    CloseButtonComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class CommonComponentsModule { }
