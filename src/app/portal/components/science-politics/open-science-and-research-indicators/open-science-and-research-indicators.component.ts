import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from '@shared/services/utility.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { CutContentPipe } from '../../../../shared/pipes/cut-content.pipe';
import { NgFor } from '@angular/common';
import { BannerDividerComponent } from '../../../../shared/components/banner-divider/banner-divider.component';

@Component({
    selector: 'app-open-science-and-research-indicators',
    templateUrl: './open-science-and-research-indicators.component.html',
    styleUrls: ['./open-science-and-research-indicators.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        BannerDividerComponent,
        NgFor,
        CutContentPipe,
        SafeUrlPipe,
    ]
})
export class OpenScienceAndResearchIndicatorsComponent implements OnInit {
  currentLocale = '';
  routeSub: Subscription;

  currentPageUrl = '/science-innovation-policy/open-science-and-research-indicators/';

  indicatorContent = [];
  subPageLinks: any;
  indicatorsActive = false;

  constructor(private route: ActivatedRoute, private utilityService: UtilityService, private appSettingsService: AppSettingsService) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this.mapFetchedDataToContent();
  }

  mapFetchedDataToContent() {
    this.indicatorContent = this.route.snapshot.data.pages.filter(
        (el) => el.id.startsWith('indicators_general')
      );
    this.subPageLinks = this.route.snapshot.data.pages.filter(
      (el) => el.id.startsWith('indicators_content')
    );
    this.subPageLinks.map(link => (
      link.image = 'assets/img/indicators/indicators_thumbnail_' + link.id.substring(19, link.id.length) + '.png'
    ));
  }
}
