import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { FilterService } from 'src/app/services/filter.service';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss']
})
export class FundingsComponent implements OnInit, OnDestroy {
  fundingData: any [];
  @Input() tabData: string;
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  filterSub: Subscription;
  filter: object;
  filtersOn: boolean;

  constructor( private searchService: SearchService, private filterService: FilterService) {
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.filterSub = this.filterService.filters.subscribe(filter => {
      this.filter = filter;

      // Check if any filters are selected
      Object.keys(this.filter).forEach(key => this.filtersOn = this.filter[key].length > 0 || this.filtersOn);

      // Get data
      this.getFundingData();
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // Get funding data, check if filtered or all data
  getFundingData() {
    // Get data
    this.searchService.getData()
    .pipe(map(fundingData => [fundingData]))
    .subscribe(fundingData => this.fundingData = fundingData,
               error => this.errorMessage = error as any);
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }
}
