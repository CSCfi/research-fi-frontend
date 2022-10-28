import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from '@shared/services/utility.service';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-open-science-and-research-indicators',
  templateUrl: './open-science-and-research-indicators.component.html',
  styleUrls: ['./open-science-and-research-indicators.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
    if (this.areIndicatorsActive()) {
      this.indicatorsActive = true;
      this.mapFetchedDataToContent();
    }
    else {
      this.generatePlaceholderContent();
    }
  }

  areIndicatorsActive() {
    let isActive = this.route.snapshot.data.pages.some(
      (el) => el.id.startsWith('indicators_not_active')
    );
    return isActive;
  }

  generatePlaceholderContent() {
    this.indicatorContent = this.route.snapshot.data.pages.filter(
      (el) => el.id.startsWith('indicators_general')
    );
    this.indicatorContent.map(item => {
      item.contentFi = $localize`:@@comingSoon:Tulossa pian`;
      item.contentFi += '.';
    });
    this.indicatorContent.map(item => {
      item.contentSv = $localize`:@@comingSoon:Tulossa pian`;
      item.contentSv += '.';
    });
    this.indicatorContent.map(item => {
      item.contentEn = $localize`:@@comingSoon:Tulossa pian`;
      item.contentEn += '.';
    });
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
