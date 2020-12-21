import { NgModule } from '@angular/core';
import { UiLibraryComponent } from './ui-library.component';
import { HeaderComponent } from './header/header.component';



@NgModule({
  declarations: [UiLibraryComponent, HeaderComponent],
  imports: [
  ],
  exports: [UiLibraryComponent]
})
export class UiLibraryModule { }
