import { Component, OnInit, ViewChild, ElementRef, Injector, Input, ComponentRef, OnChanges, SimpleChanges } from '@angular/core';
import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { createDomPortalHost } from './utils';
import { SearchService } from 'src/app/services/search.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PublicationsComponent } from '../publications/publications.component';
import { FundingsComponent } from '../fundings/fundings.component';
import { OrganizationsComponent } from '../organizations/organizations.component';
import { PersonsComponent } from '../persons/persons.component';

@Component({
  selector: 'app-search-results',
  template: '<div #portalHost></div>'
})
export class SearchResultsComponent implements OnInit, OnChanges {

  portalHost: DomPortalHost;
  @ViewChild('portalHost') elRef: ElementRef;
  componentRef: ComponentRef<any>;

  @Input() currentTab;
  @Input() updateFilters;

  tabChanged = true;

  responseData: any;
  filtersOn: boolean;
  filter: object;
  errorMessage: any;

  tabSub: Subscription;
  filterSub: Subscription;

  constructor(private injector: Injector, private searchService: SearchService) { }

  ngOnInit() {
    this.portalHost = createDomPortalHost(this.elRef, this.injector);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reset data so previous data is not displayed until new data is loaded
    if (changes.currentTab && !changes.currentTab.firstChange ||
        changes.updateFilters && !changes.updateFilters.firstChange) {
      this.componentRef.instance.resultData = undefined;
    }
    this.getResultData();
  }

  // Get result data, check if filtered or all data
  getResultData() {
    // Get data, then change component
    this.searchService.getData()
    .pipe(map(responseData => [responseData]))
    .subscribe(
      responseData => this.responseData = responseData,
      error => this.errorMessage = error as any,
      () => this.changeComponent(this.currentTab)
    );
  }

  changeComponent(tab) {
    let child: any;
    switch (tab.data) {
      case 'publications':
        child = PublicationsComponent;
        break;

      case 'fundings':
        child = FundingsComponent;
        break;

      case 'persons':
        child = PersonsComponent;
        break;

      case 'organizations':
        child = OrganizationsComponent;
        break;

      default:
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
  template: '<p>Error</p>'
})
export class EmptyResultComponent {
  @Input() resultData;
}
