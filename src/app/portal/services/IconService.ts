import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomIcon, customIcons } from '../../utility/custom-icons';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
  }

  public createIcons() {
    customIcons.forEach((icon: CustomIcon) => {
      //console.log(icon.path);
      this.matIconRegistry.setDefaultFontSetClass('justatest');
      this.matIconRegistry.addSvgIcon(
        icon.idString,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
  }
}
