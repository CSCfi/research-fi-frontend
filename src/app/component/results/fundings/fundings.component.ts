import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { FilterService } from 'src/app/services/filter.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss']
})
export class FundingsComponent implements OnInit, OnDestroy {
  @Input() fundingData: any [];
  @Input() tabData: string;
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  queryParams: any;
  filter: any;
  filtersOn: boolean;

  constructor( private searchService: SearchService, private filterService: FilterService, private route: ActivatedRoute ) {
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = {year: params.year || [], status: params.status || []};
      // Check if multiple filters selected and send to service
      this.filterService.getFilter(this.filter);

      // Check if any filters are selected
      Object.keys(this.filter).forEach(key => this.filtersOn = this.filter[key].length > 0 || this.filtersOn);

      // If selected filters, filtered API call
      if (this.filtersOn === true) {
        this.getFilteredData();
      }
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // This gets called in pagination component, Assign results to fundingData
  getFundingData() {
    // Check if url contains filter
    if (this.filtersOn === true) {
      this.searchService.filterData();
    } else {
      this.searchService.getAllResults()
      .pipe(map(fundingData => [fundingData]))
      .subscribe(fundingData => {
        this.fundingData = fundingData;
      },
        error => this.errorMessage = error as any);
    }
  }

  getFilteredData() {
    this.searchService.filterData()
    .pipe(map(fundingData => [fundingData]))
    .subscribe(fundingData => {
      this.fundingData = fundingData;
    },
      error => this.errorMessage = error as any);
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }
}
