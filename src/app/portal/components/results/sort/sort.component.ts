//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SortService } from '@portal/services/sort.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

type SortOption = { label: string; value: string };
@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SortComponent implements OnInit, OnDestroy {
  tabLink: string;
  tabFields: any;
  currentSort: SortOption;
  tabSub: any;
  sortByRelevance = {
    label: $localize`:@@sortByRelevance:Osuvin tulos ensin`,
    value: 'reset',
  };
  faChevronDown = faChevronDown;

  // Assign values to dropdown list by current tab
  publicationFields: SortOption[] = [
    { label: $localize`:@@sortNewest:Uusin ensin`, value: 'yearDesc' },
    { label: $localize`:@@sortOldest:Vanhin ensin`, value: 'year' },
    { label: $localize`:@@sortPublicationAsc:Nimike (A-Ö)`, value: 'name' },
    {
      label: $localize`:@@sortAuthorAsc:Ensimmäinen tekijä (A-Ö)`,
      value: 'author',
    },
  ];
  fundingFields = [
    { label: $localize`:@@sortNewest:Uusin ensin`, value: 'yearDesc' },
    { label: $localize`:@@sortOldest:Vanhin ensin`, value: 'year' },
    { label: $localize`:@@sortProjectNameAsc:Hanke (A-Ö)`, value: 'name' },
    {
      label: $localize`:@@sortFunderNameAsc:Rahoittaja (A-Ö)`,
      value: 'funder',
    },
  ];
  infraFields = [
    { label: $localize`:@@sortAcronymAsc:Lyhenne (A-Ö)`, value: 'acronym' },
    {
      label: $localize`:@@sortInfraNameAsc:Infrastruktuuri (A-Ö)`,
      value: 'name',
    },
    {
      label: $localize`:@@sortOrgNameAsc:Organisaatio (A-Ö)`,
      value: 'organization',
    },
  ];
  organizationFields = [
    { label: $localize`:@@sortOrgNameAsc:Organisaatio (A-Ö)`, value: 'name' },
    { label: $localize`:@@sortSectorNameAsc:Sektori (A-Ö)`, value: 'sector' },
  ];
  mobileStatusSub: any;
  mobile: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sortService: SortService,
    private tabChangeService: TabChangeService,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit() {
    // Subscribe to current tab parameter
    this.tabSub = this.tabChangeService.currentTab.subscribe((tab) => {
      console.log(tab);
      switch (tab.link) {
        case 'publications': {
          this.tabFields = this.publicationFields;
          break;
        }
        case 'fundings': {
          this.tabFields = this.fundingFields;
          break;
        }
        case 'infrastructures': {
          this.tabFields = this.infraFields;
          break;
        }
        case 'organizations': {
          this.tabFields = this.organizationFields;
          break;
        }
        default: {
          this.tabFields = [];
        }
      }
      // Get sort from url and reset sort on tab change
      if (!this.currentSort ? this.currentSort : this.sortByRelevance) {
      }

      // Set value from query parameters on initialization
      this.currentSort =
        this.tabFields.find(
          (item) => item.value === this.route.snapshot.queryParams.sort
        ) || this.sortByRelevance;
    });

    // Handle mobile status
    this.mobileStatusSub = this.appSettingsService.mobileStatus.subscribe(
      (status: boolean) => {
        this.mobile = status;
      }
    );
  }

  // Send value to service and rewrite url
  orderBy(option: SortOption): void {
    this.currentSort = option;
    this.sortService.updateSort(option.value);
    this.navigate();
  }

  navigate() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: this.currentSort.value },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy() {
    this.tabSub?.unsubscribe();
    this.mobileStatusSub?.unsubscribe();
  }
}
