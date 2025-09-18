import { Component, Input } from '@angular/core';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';

export interface BannerContent {
  bannerId?: string;
  iconType: 'info' | 'warning',
  heading: string;
  textContent: string;
  link1Text: string;
  link1Target: 'url' | 'internal';
  link1Url: string;
  link1ButtonType?: 'text' | 'primary' | 'secondary' | 'tertiary',
  link2Target?: 'url' | 'internal';
  link2Url?: string;
  link2Text?: string;
  link2ButtonType?: 'text'| 'primary' | 'secondary' | 'tertiary',
  rememberDismissed: boolean;
  bannerType: 'portal-banner' | 'profile-tool-banner',
  bannerTheme: 'blue' | 'yellow';
}

@Component({
    selector: 'app-general-info-banner',
    imports: [
        SvgSpritesComponent,
        RouterLink,
        NgIf,
        NgClass
    ],
    templateUrl: './general-info-banner.component.html',
    styleUrl: './general-info-banner.component.scss'
})
export class GeneralInfoBannerComponent {
  @Input() bannerContent: BannerContent;

  bannerManuallyHidden = false;

  isBannerVisible(){
    if (this.bannerContent.rememberDismissed === true && this.bannerContent.bannerId) {
      if (sessionStorage.getItem('banner_dismissed_' + this.bannerContent.bannerId) === 'true') {
        return false
      }
    }
    return this.bannerManuallyHidden ? false : true;
  }

  dismissBanner(){
    this.bannerManuallyHidden = true;
    if (this.bannerContent.rememberDismissed && this.bannerContent.bannerId && this.bannerContent.bannerId !== '') {
      sessionStorage.setItem('banner_dismissed_' + this.bannerContent.bannerId, 'true');
    }
  }
}
