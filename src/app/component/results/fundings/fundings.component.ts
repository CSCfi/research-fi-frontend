import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss']
})
export class FundingsComponent implements OnInit, OnDestroy {
  @Input() fundingData: any [];
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  queryParams: any;
  paginationCheck: boolean;

  constructor( private searchService: SearchService, private route: ActivatedRoute ) {
    // Check if http request is POST or GET
    this.paginationCheck = this.searchService.requestCheck;
  }

  ngOnInit() {
    // Get Data and subscripe to url query parameters
    this.queryParams = this.route.queryParams.subscribe(this.queryParams);
  }

  dataSource(): string {
    return this.paginationCheck ? this.fundingData[0].hits.hits :
                                  this.fundingData[0].aggregations._index.buckets.hankkeet.index_results.hits.hits;
  }

  // Assign results to fundingData
  getFundingData() {
    this.paginationCheck = true;
    this.searchService.getFundings()
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
