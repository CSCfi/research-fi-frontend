import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
//import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
//import { faExternalLinkAlt, faInfoCircle, faMinus, faPlus, faSlidersH } from '@fortawesome/free-solid-svg-icons';
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
    // Add global Font awesome icons
    //iconLibraryFa.addIcons(faExternalLinkAlt as any, faInfoCircle as any, faSlidersH as any, faPlus as any, faMinus as any);
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
