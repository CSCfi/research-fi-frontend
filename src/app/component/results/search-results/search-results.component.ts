import { Component, OnInit, ViewChild, ElementRef, Injector, Input, ComponentRef } from '@angular/core';
import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { createDomPortalHost } from './utils';
import { SearchService } from 'src/app/services/search.service';
import { Subscription } from 'rxjs';
import { FilterService } from 'src/app/services/filter.service';
import { map } from 'rxjs/operators';
import { TabChangeService } from 'src/app/services/tab-change.service';

@Component({
  selector: 'app-search-results',
  template: '<div #portalHost></div>'
})
export class SearchResultsComponent implements OnInit {

  portalHost: DomPortalHost;
  @ViewChild('portalHost') elRef: ElementRef;
  components = [ChildOne, ChildTwo, ChildThree];

  // tslint:disable-next-line: variable-name
  private _currentTab;
  get currentTab(): any {
    return this._currentTab;
  }
  @Input() set currentTab(val: any) {
    this._currentTab = val;
    this.getResultData();
  }

  responseData: any;
  filtersOn: boolean;
  filter: object;
  // currentTab: any;
  errorMessage: any;

  tabSub: Subscription;
  filterSub: Subscription;

  constructor(private injector: Injector, private searchService: SearchService, private filterService: FilterService,
              private tabChangeService: TabChangeService) { }

  ngOnInit() {
    this.portalHost = createDomPortalHost(this.elRef, this.injector);

    this.filterSub = this.filterService.filters.subscribe(filter => {
      this.filter = filter;

      // Check if any filters are selected
      Object.keys(this.filter).forEach(key => this.filtersOn = this.filter[key].length > 0 || this.filtersOn);

      // Get data
      this.getResultData();
    });
  }

  // Get funding data, check if filtered or all data
  getResultData() {
    // Get data
    this.searchService.getData()
    .pipe(map(responseData => [responseData]))
    .subscribe(
      responseData => this.responseData = responseData,
      error => this.errorMessage = error as any,
      () => this.changeComponent(this.currentTab)
    );
  }

  changeComponent(tab) {
    switch (tab.data) {
      case 'publiactions':
        break;

      case 'fundings':
        break;

      default:
        break;
    }

    const randomChild = ChildOne;
    const myPortal = new ComponentPortal(randomChild);
    this.portalHost.detach();
    const componentRef = this.portalHost.attach(myPortal);
    componentRef.instance.fundingData = this.responseData;
  }
}

@Component({
  selector: 'app-child-one',
  templateUrl: '../fundings/fundings.component.html'
})
export class ChildOne {
  @Input() fundingData;
  expandStatus: Array<boolean> = [];
}

@Component({
  selector: 'app-child-two',
  template: `<p>I am child two. <strong>{{myInput}}</strong></p>`
})
export class ChildTwo {
  @Input() myInput = '';
}

@Component({
  selector: 'app-child-three',
  template: `<p>I am child three. <strong>{{myInput}}</strong></p>`
})
export class ChildThree {
  @Input() myInput = '';
}
