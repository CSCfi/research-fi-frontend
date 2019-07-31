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

  constructor( private searchService: SearchService, private filterService: FilterService, private route: ActivatedRoute ) {
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = params.filter;
      // Check if multiple filters selected and send to service
      if (Array.isArray(this.filter)) {
      this.filterService.getFilter(this.filter);
      } else if (this.filter !== undefined) {
        this.filterService.getFilter(this.filter);
      }

      if (this.filter !== undefined && this.filter.length > 0) {
        this.getFilteredData();
      } else {
        // this.getPublicationData();
      }
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // Assign results to fundingData
  getFundingData() {
    // Check if url contains filter
    if (this.filter !== undefined && this.filter.length > 0) {
      this.filterService.filterData();
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
    this.filterService.filterData()
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
