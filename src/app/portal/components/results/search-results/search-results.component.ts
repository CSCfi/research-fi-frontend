//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Injector,
  Input,
  ComponentRef,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { createDomPortalOutlet } from './utils';
import { SearchService } from '@portal/services/search.service';
import { Subscription } from 'rxjs';
import { PublicationsComponent } from '../publications/publications.component';
import { FundingsComponent } from '../fundings/fundings.component';
import { OrganizationsComponent } from '../organizations/organizations.component';
import { PersonsComponent } from '../persons/persons.component';
import { InfrastructuresComponent } from '../infrastructures/infrastructures.component';
import { Search } from 'src/app/portal/models/search.model';
import { DatasetsComponent } from '../datasets/datasets.component';

/*
 * Dynamically render component for selected tab.
 * Eg. results/publications
 */
@Component({
  selector: 'app-search-results',
  template: '<div #portalHost></div>',
})
export class SearchResultsComponent implements OnInit, OnChanges, OnDestroy {
  portalHost: DomPortalOutlet;
  @ViewChild('portalHost', { static: true }) elRef: ElementRef;
  componentRef: ComponentRef<any>;

  @Input() currentTab;
  @Input() updateFilters;

  tabChanged = true;

  responseData: Search;
  filtersOn: boolean;
  filter: object;
  errorMessage: any;

  dataSub: Subscription;

  constructor(
    private injector: Injector,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.portalHost = createDomPortalOutlet(this.elRef, this.injector);
    // Dont get results with invalid tab
    if (this.currentTab) {
      this.getResultData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.currentTab && !changes.currentTab.firstChange) ||
      (changes.updateFilters && !changes.updateFilters.firstChange)
    ) {
      if (this.componentRef) {
        // Reset data so previous data is not displayed until new data is loaded
        this.componentRef.instance.resultData = undefined;
      }
      this.getResultData();
    }
  }

  getResultData() {
    // Get data, then change component
    this.dataSub = this.searchService
      .getData()
      // .pipe(map(responseData => [responseData]))
      .subscribe({
        next: (responseData) => {
          this.responseData = responseData;
          this.searchService.updateTotal(this.responseData.total);
        },
        error: (error) => (this.errorMessage = error as any),
        complete: () => this.changeComponent(this.currentTab),
      });
  }

  ngOnDestroy(): void {
    this.dataSub.unsubscribe();
  }

  changeComponent(tab) {
    let child: any;
    switch (tab.data) {
      case 'publications':
        child = PublicationsComponent;
        break;

      case 'persons':
        child = PersonsComponent;
        break;

      case 'fundings':
        child = FundingsComponent;
        break;

      case 'datasets':
        child = DatasetsComponent;
        break;

      case 'infrastructures':
        child = InfrastructuresComponent;
        break;

      case 'organizations':
        child = OrganizationsComponent;
        break;

      default:
        child = EmptyResultComponent;
        break;
    }

    const myPortal = new ComponentPortal(child);
    this.portalHost.detach();
    this.componentRef = this.portalHost.attach(myPortal);
    this.componentRef.instance.resultData = this.responseData;
  }
}

@Component({
  selector: 'app-empty-result',
  template: '<b>Component not implemented yet</b>',
})
export class EmptyResultComponent {
  @Input() resultData;
}
