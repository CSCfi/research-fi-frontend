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

  constructor( private searchService: SearchService, private filterService: FilterService, private route: ActivatedRoute ) {
  }

  ngOnInit() {
    // Get Data and subscripe to url query parameters
    this.queryParams = this.route.queryParams.subscribe(this.queryParams);
  }

  // Assign results to fundingData
  getFundingData() {
    this.searchService.getAllResults()
    .pipe(map(fundingData => [fundingData]))
    .subscribe(fundingData => {
      this.fundingData = fundingData;
    },
      error => this.errorMessage = error as any);
  }

  getFilteredData() {
    this.filterService.filterPublications()
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
