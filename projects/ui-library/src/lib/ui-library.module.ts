import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CloseButtonComponent } from './buttons/close-button/close-button.component';
import { PrimaryActionButtonComponent } from './buttons/primary-action-button/primary-action-button.component';
import { SecondaryButtonComponent } from './buttons/secondary-button/secondary-button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ClickOutsideModule } from 'ng-click-outside';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { WINDOW_PROVIDERS } from './services/window.service';
import { LogoComponent } from './header/logo/logo.component';
import { NavigationComponent } from './header/navigation/navigation.component';

@NgModule({
  declarations: [
    CloseButtonComponent,
    PrimaryActionButtonComponent,
    SecondaryButtonComponent,
    LogoComponent,
    NavigationComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule.withServerTransition({ appId: 'serverUiLibrary' }),
    MatFormFieldModule,
    MatSelectModule,
    ClickOutsideModule,
    FontAwesomeModule,
  ],
  exports: [
    CloseButtonComponent,
    PrimaryActionButtonComponent,
    SecondaryButtonComponent,
    LogoComponent,
    NavigationComponent,
  ],
  providers: [WINDOW_PROVIDERS],
})
export class UiLibraryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: UiLibraryModule,
      providers: [WINDOW_PROVIDERS],
    };
  }
}
