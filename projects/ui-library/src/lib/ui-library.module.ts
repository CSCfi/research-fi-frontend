import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UiLibraryComponent } from './ui-library.component';
import { HeaderComponent } from './header/header.component';
import { BrowserModule } from '@angular/platform-browser';
import { CloseButtonComponent } from './buttons/close-button/close-button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ClickOutsideModule } from 'ng-click-outside';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { WINDOW_PROVIDERS } from './services/window.service';

@NgModule({
  declarations: [UiLibraryComponent, HeaderComponent, CloseButtonComponent],
  imports: [
    RouterModule,
    BrowserModule,
    MatFormFieldModule,
    MatSelectModule,
    ClickOutsideModule,
    FontAwesomeModule,
  ],
  exports: [UiLibraryComponent, HeaderComponent],
  providers: [WINDOW_PROVIDERS],
})
export class UiLibraryModule { }
