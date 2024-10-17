//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { faAlignLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { Search } from 'src/app/portal/models/search.model';
import { SearchService } from 'src/app/portal/services/search.service';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { SingleItemService } from 'src/app/portal/services/single-item.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ShareComponent } from '../share/share.component';
import { RelatedLinksComponent } from '../related-links/related-links.component';
import { SingleResultLinkComponent } from '../single-result-link/single-result-link.component';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { DatasetAuthorComponent } from './dataset-author/dataset-author.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { SecondaryButtonComponent } from '../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { SearchBarComponent } from '../../search-bar/search-bar.component';

@Component({
    selector: 'app-single-dataset',
    templateUrl: './single-dataset.component.html',
    styleUrls: ['./single-dataset.component.scss'],
    standalone: true,
    imports: [
        SearchBarComponent,
        NgIf,
        RouterLink,
        BreadcrumbComponent,
        NgFor,
        SecondaryButtonComponent,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        NgClass,
        TooltipModule,
        FontAwesomeModule,
        DatasetAuthorComponent,
        MatCard,
        MatCardTitle,
        SingleResultLinkComponent,
        RelatedLinksComponent,
        ShareComponent,
        MatProgressSpinner,
        SafeUrlPipe,
    ],
})
export class SingleDatasetComponent implements OnInit {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  private metaTags = MetaTags.singleDataset;
  private commonTags = MetaTags.common;
  showMore = $localize`:@@showMore:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;

  tab = 'datasets';

  infoFields = [
    { label: $localize`:@@description:Kuvaus`, field: 'description' },
    { label: $localize`:@@yearOfPublication:Julkaisuvuosi`, field: 'year' },
    { label: $localize`:@@datasetType:Aineiston tyyppi`, field: 'type' },
  ];

  authors = [
    {
      label: $localize`:@@datasetAuthors:Tekijät`,
      field: 'authors',
      tooltip: $localize`:@@datasetAuthorsTooltip:Tutkimukseen tai aineiston tekemiseen osallistuneet henkilöt ja organisaatiot. `,
    },
  ];

  project = [
    {
      label: $localize`:@@datasetProject:Projekti`,
      field: 'project',
      tooltip: $localize`:@@datasetProjectTooltip:Projekti, jonka tuotoksena aineisto on luotu. `,
    },
  ];

  otherInfoFields = [
    {
      label: $localize`:@@fieldsOfScience:Tieteenalat`,
      field: 'fieldsOfScience',
      tooltip: $localize`:@@datasetFieldFilterTooltip:Tilastokeskuksen tieteenalaluokitus.`,
    },
    {
      label: $localize`:@@language:Kieli`,
      field: 'lang',
      tooltip: $localize`:@@datasetLangFilterTooltip:Aineistossa käytetty kieli.`,
    },
    {
      label: $localize`:@@datasetAccess:Saatavuus`,
      field: 'availability',
      tooltip:
        '<p><strong>' +
        $localize`:@@datasetAccessOpen:Avoin` +
        ': </strong>' +
        $localize`:@@datasetAccessOpenTooltip:Aineisto on avoimesti saatavilla` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessRestricted:Saatavuutta rajoitettu` +
        ': </strong>' +
        $localize`:@@datasetAccessRestrictedTooltip:Aineiston saatavuutta on rajoitettu. Katso rajoituksen tarkemmat tiedot aineiston lähteestä.` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessLogin:Vaatii kirjautumisen` +
        ': </strong>' +
        $localize`:@@datasetAccessLoginTooltip:Pääsy aineistoon vaatii kirjautumisen Fairdata-palvelussa.` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessPermit:Vaatii luvan` +
        ': </strong>' +
        $localize`:@@datasetAccessPermitTooltip:Pääsy aineistoon vaatii luvan hakemista Fairdata-palvelussa.` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessEmbargo:Embargo` +
        ': </strong>' +
        $localize`:@@datasetAccessEmbargoTooltip:Embargo eli julkaisuviive määrittää ajankohdan, jolloin aineisto on saatavilla.` +
        '</p>',
    },
    {
      label: $localize`:@@license:Lisenssi`,
      field: 'license',
      tooltip: $localize`:@@datasetLicenseTooltip:Lisenssi, joka määrittelee aineiston käyttöehdot.`,
    },
    { label: $localize`:@@keywords:Avainsanat`, field: 'keywords' },
    { label: $localize`:@@subjectHeadings:Asiasanat`, field: 'subjectHeadings' },
    {
      label: $localize`:@@temporalCoverage:Ajallinen kattavuus`,
      field: 'coverage',
      tooltip: $localize`:@@datasetTemporalCoverageTooltip:Ajanjakso, jonka aineisto kattaa(esim. aikaväli jolloin havaintoja on tehty).`,
    },
  ];

  otherFields = [
    {
      label: $localize`:@@datasetsRelated:Liittyvät aineistot`,
      field: 'relatedDatasets',
      tooltip: '',
    },
  ];

  linksFields = [
    { label: 'DOI', field: 'doi', tooltip: '' },
    { label: 'URN', field: 'urn', tooltip: '' },
    { label: 'URL', field: 'fairdataUrl', tooltip: '' },
    { label: 'URL', field: 'url', tooltip: '' },
  ];

  relatedList = [
    {
      labelFi: $localize`:@@publications:Julkaisut`,
      tab: 'publications',
      disabled: true,
    },
    { labelFi: $localize`:@@authors:Tutkijat`, tab: 'persons', disabled: true },
    { labelFi: $localize`:@@fundings:Hankkeet`, tab: '', disabled: true },
    {
      labelFi: $localize`:@@infrastructures:Infrastruktuurit`,
      tab: 'infrastructures',
      disabled: true,
    },
    {
      labelFi: $localize`:@@otherResearchActivity:Muu tutkimustoiminta`,
      tab: '',
      disabled: true,
    },
  ];

  copyReferences = $localize`:@@copyReferences:Kopioi viitetiedot`;
  copyToClipboard = $localize`:@@copyToClipboard:Kopioi leikepöydälle`;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;
  idSub: Subscription;
  expand: boolean;
  latestSubUnitYear: string;
  faIcon = faAlignLeft;
  faChevronDown = faChevronDown;
  subUnitSlice = 10;
  currentLocale: string;
  tabData: any;
  focusSub: Subscription;
  dataSub: Subscription;
  currentVersion: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private singleService: SingleItemService,
    private searchService: SearchService,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    public utilityService: UtilityService,
    private settingsService: SettingsService,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.route.params.subscribe((params) => {
      this.getData(params.id);
    });
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.datasets;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'datasets'
    );
    this.searchTerm = this.searchService.searchTerm;
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.backToResultsLink.nativeElement.focus();
        }
      }
    );
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.dataSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.dataSub = this.singleService.getSingleDataset(id).subscribe({
      next: (responseData) => {
        this.responseData = responseData;
        const dataset = this.responseData.datasets[0];
        if (dataset) {
          switch (this.localeId) {
            case 'fi': {
              this.setTitle(dataset.name + ' - Tiedejatutkimus.fi');
              break;
            }
            case 'en': {
              this.setTitle(dataset.name.trim() + ' - Research.fi');
              break;
            }
            case 'sv': {
              this.setTitle(dataset.name.trim() + ' - Forskning.fi');
              break;
            }
          }
          const titleString = this.utilityService.getTitle();
          this.srHeader.nativeElement.innerHTML = titleString.split(' - ', 1);
          this.utilityService.addMeta(
            titleString,
            this.metaTags['description' + this.currentLocale],
            this.commonTags['imgAlt' + this.currentLocale]
          );

          // Set version label by active dataset version number
          if (dataset.datasetVersions) {
            this.currentVersion = `${$localize`:@@version:Versio`} ${
              dataset.datasetVersions.find(
                (version) => version.id === dataset.id
              ).versionNumber
            }`;
          }

          this.shapeData();
          this.filterData();
        }
      },
      error: (error) => (this.errorMessage = error as any),
    });
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: { field: string }) => {
      return UtilityService.stringHasContent(
        this.responseData.datasets[0][item.field]
      );
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter((item) => checkEmpty(item));
    this.otherInfoFields = this.otherInfoFields.filter((item) =>
      checkEmpty(item)
    );
    this.project = this.project.filter((item) => checkEmpty(item));
    this.otherFields = this.otherFields.filter((item) => checkEmpty(item));
    this.linksFields = this.linksFields.filter((item) => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData.datasets[0];
  }

  expandDescription() {
    this.expand = !this.expand;
  }

  // Resetting response data renders loading indicator and therefore
  // helps user to understand that content has changed.
  // TODO: This could be achieved with all single item pages with usage of route resolvers
  changeDatasetVersion(id: string) {
    this.responseData = null;
    this.router.navigate(['/results/dataset/' + id]);
  }
}
