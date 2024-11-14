//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  Inject,
  LOCALE_ID
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { SearchService } from '../../../services/search.service';
import { Subscription } from 'rxjs';
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { Search } from 'src/app/portal/models/search.model';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { decisionMakerLabels } from '../../../../utility/localization';
import { ThousandSeparatorPipe } from '../../../../shared/pipes/thousand-separator.pipe';
import { ShareComponent } from '../share/share.component';
import { RelatedLinksComponent } from '../related-links/related-links.component';
import { SingleResultLinkComponent } from '../single-result-link/single-result-link.component';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { OrcidComponent } from '../../../../shared/components/orcid/orcid.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NgIf, NgFor, NgClass, NgSwitch, NgSwitchDefault, NgSwitchCase, DatePipe, JsonPipe } from '@angular/common';
import { SearchBarComponent } from '../../search-bar/search-bar.component';

@Component({
  selector: 'app-single-project',
  templateUrl: './single-project.component.html',
  styleUrls: ['./single-project.component.scss'],
  standalone: true,
  imports: [
    SearchBarComponent,
    NgIf,
    RouterLink,
    BreadcrumbComponent,
    NgFor,
    TooltipModule,
    FontAwesomeModule,
    NgClass,
    NgSwitch,
    NgSwitchDefault,
    OrcidComponent,
    NgSwitchCase,
    MatCard,
    MatCardTitle,
    SingleResultLinkComponent,
    RelatedLinksComponent,
    ShareComponent,
    DatePipe,
    ThousandSeparatorPipe,
    JsonPipe
  ]
})
export class SingleProjectComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  tab = 'projects';
  private metaTags = MetaTags.singleFunding;
  private commonTags = MetaTags.common;
  public academyOfFinland = this.translateAcademyOfFinland(this.localeId);

  info = [
    {
      label: $localize`:@@spAbbreviation:Lyhenne`,
      field: 'abbreviation',
      tooltip: $localize`:@@spAbbreviationTooltip:Lyhenne`,
      showOnlyLabel: false
    },
    {
      label: $localize`:@@spStartYear:Aloitusvuosi`,
      field: 'startYear',
      tooltip: $localize`:@@spStartYearTooltip:Hankkeen alkamisvuosi`,
      showOnlyLabel: false
    },
    {
      label: $localize`:@@spEndYear:Päättymisvuosi`,
      field: 'endYear',
      tooltip: $localize`:@@spEndYearTooltip:Hankkeen päättymisvuosi`,
      showOnlyLabel: false
    },
    {
      label: $localize`:@@spDescription:Kuvaus`,
      field: 'summary',
      tooltip: $localize`:@@spDescriptionTooltip:Kuvaus kertoo tiiviisti hankkeesta`,
      showOnlyLabel: false
    },
    {
      label: $localize`:@@spObjectives:Tavoitteet`,
      field: 'goals',
      tooltip: $localize`:@@spObjectivesTooltip:Kuvaus hankkeelle asetetuista tavoitteista`,
      showOnlyLabel: false
    },
    {
      label: $localize`:@@spParticipants:Osallistujat`,
      field: 'participants',
      tooltip: $localize`:@@spParticipantsTooltip:Hankkeeseen osallistuvat organisaatiot ja henkilöt`,
      showOnlyLabel: true,
      subFields: [{
        label: $localize`:@@spOrganizations:Organisaatiot`,
        field: 'responsibleOrganizations',
        showOnlyLabel: false
      },
        {
          label: $localize`:@@spPersons:Henkilöt`,
          field: 'responsiblePersons',
        }]
    },
    {
      label: $localize`:@@spResults:Tulokset`,
      field: 'results',
      tooltip: $localize`:@@spResultsTooltip:Hankkeen saavuttamat tulokset`,
      showOnlyLabel: true,
      subFields: [{
        label: $localize`:@@resultsAndEffect:Tulokset ja vaikuttavuus`,
        field: 'outcomeEffect',
      }]
    },
    {
      label: $localize`:@@spotherInfo:Muut tiedot`,
      field: 'additionalInfo',
      showOnlyLabel: true,
      subFields: [{
        label: $localize`:@@spKeywordsTooltip:Avainsanat`,
        field: 'keywords',
        tooltip: $localize`:@@spKeywordsTooltip:Hankkeen avainsanat`,
      }]
    }
  ];

  link = [
    { label: $localize`:@@links:Linkit`, field: 'projectHomepage' }
  ];

  homepageTooltip = {
    tooltip: $localize`:@@spHomePageTooltip:Tiedejatutkimus.fi -palvelun ulkopuolella oleva verkkosivu, jossa hankkeesta on tarkempaa tietoa.`
  };

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;
  idSub: Subscription;

  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;

  expand: boolean;
  infoFields: any[];
  otherFields: any[];
  projectURL: any;
  abbreviation: string;
  funderFields: any[];
  currentLocale: string;
  tabData: any;
  showMore = $localize`:@@showMore:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;
  relatedData: any;
  focusSub: Subscription;
  dataSub: Subscription;

  hasFundedPerson = false;

  protected readonly decisionMakerLabels = decisionMakerLabels;

  constructor(
    private route: ActivatedRoute,
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
    this.tabQueryParams = this.tabChangeService.tabQueryParams.projects;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'projects'
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

  getData(id) {
    // Check if id is number, convert to -1 if string to get past elasticsearch number mapping
    const idNumber = parseInt(id, 10) ? id : -1;
    this.dataSub = this.singleService
      .getSingleProject(idNumber)
      // .pipe(map(responseData => [responseData]))
      .subscribe({
        next: (responseData) => {
          this.responseData = responseData;
          const project = this.responseData.projects[0];
          if (project) {
            switch (this.localeId) {
              case 'fi': {
                this.setTitle(project.name + ' - Tiedejatutkimus.fi');
                break;
              }
              case 'en': {
                this.setTitle(project.name + ' - Research.fi');
                break;
              }
              case 'sv': {
                this.setTitle(project.name + ' - Forskning.fi');
                break;
              }
            }
            const titleString = this.utilityService.getTitle();

            if (titleString) {
              this.srHeader.nativeElement.innerHTML = titleString.split(' - ', 1);
            }

            this.shapeData();

            this.infoFields = this.info;
          }
        },
        error: (error) => (this.errorMessage = error as any)
      });
  }

  shapeData() {
    const source = this.responseData.projects[0];
    const locale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);


    // Related data
    let relatedOrgs = [];

    this.relatedData = {
      organizations: relatedOrgs
    };
    this.projectURL = source.projectURL;
    this.abbreviation = source.abbreviation;
  }

  expandDescription() {
    this.expand = !this.expand;
  }

  translateAcademyOfFinland(locale: string) {
    let output = 'Suomen Akatemia';

    if (locale === 'en') {
      output = 'Academy of Finland';
    }

    if (locale === 'sv') {
      output = 'Finlands Akademi';
    }

    return output;
  }
}
