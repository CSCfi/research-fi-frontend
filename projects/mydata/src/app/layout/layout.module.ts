import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { LayoutComponent } from './layout.component';
import { UiLibraryModule } from 'ui-library';

@NgModule({
  declarations: [LayoutComponent, HeaderComponent],
  imports: [CommonModule, UiLibraryModule],
  exports: [LayoutComponent],
})
export class LayoutModule {}
