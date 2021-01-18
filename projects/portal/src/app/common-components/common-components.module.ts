import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NotFoundComponent } from './not-found/not-found.component';



@NgModule({
  declarations: [InfoComponent, NotFoundComponent],
  exports: [
    InfoComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class CommonComponentsModule { }
