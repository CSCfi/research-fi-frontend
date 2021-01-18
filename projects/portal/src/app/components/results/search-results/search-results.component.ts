import { Component, OnInit, ViewChild, ElementRef, Injector, Input, ComponentRef, OnChanges, SimpleChanges } from '@angular/core';
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { createDomPortalHost } from './utils';
import { SearchService } from '@portal.services/search.service';
import { DataService } from '@portal.services/data.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PublicationsComponent } from '../publications/publications.component';
import { FundingsComponent } from '../fundings/fundings.component';
import { OrganizationsComponent } from '../organizations/organizations.component';
import { PersonsComponent } from '../persons/persons.component';
import { InfrastructuresComponent } from '../infrastructures/infrastructures.component';
<<<<<<< HEAD:src/app/component/results/search-results/search-results.component.ts
import { Search } from 'src/app/models/search.model';
import { MaterialsComponent } from '../materials/materials.component';
=======
import { Search } from '@portal.models/search.model';
>>>>>>> a419944bf7a74bfe4e56622c132e20cdd71b2a66:projects/portal/src/app/components/results/search-results/search-results.component.ts

@Component({
  selector: 'app-search-results',
  template: '<div #portalHost></div>'
})
export class SearchResultsComponent implements OnInit, OnChanges {

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

  tabSub: Subscription;
  filterSub: Subscription;

  constructor(private injector: Injector, private searchService: SearchService, private dataService: DataService) { }

  ngOnInit() {
    this.portalHost = createDomPortalHost(this.elRef, this.injector);
    // Dont get results with invalid tab
    if (this.currentTab) {
      this.getResultData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentTab && !changes.currentTab.firstChange ||
      changes.updateFilters && !changes.updateFilters.firstChange) {
        if (this.componentRef) {
          // Reset data so previous data is not displayed until new data is loaded
          this.componentRef.instance.resultData = undefined;
        }
        this.getResultData();

      }
  }

  getResultData() {
    // Get data, then change component
    this.searchService.getData()
    // .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      this.searchService.updateTotal(this.responseData.total);
    },
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

      case 'persons':
        child = PersonsComponent;
        break;

      case 'fundings':
        child = FundingsComponent;
        break;

      case 'materials':
        child = MaterialsComponent;
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
  template: '<b>Component not implemented yet</b>'
})
export class EmptyResultComponent {
  @Input() resultData;
}
