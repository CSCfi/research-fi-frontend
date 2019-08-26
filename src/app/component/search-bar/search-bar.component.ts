//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
    @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
    input: string;
    sub: Subscription;

    constructor( private searchService: SearchService, private tabChangeService: TabChangeService,
                 public router: Router, private route: ActivatedRoute, private sortService: SortService ) {
    }

    ngOnInit() {}


    newInput() {
      this.sortService.sortMethod = 'desc';
      this.searchService.updatePageNumber(1);
      // Don't trigger subscriptions, just update search term
      this.searchService.singleInput = this.publicationSearchInput.nativeElement.value;

      this.searchService.getAllResults().subscribe((data: any) => {
        this.searchService.resultData = data;
        this.searchService.redirecting = true;
        // Reduce buckets to the one with the most results
        const buckets = data.aggregations._index.buckets;
        const mostHits = Object.keys(buckets).reduce((best, index) => {
          best = best.hits < buckets[index].doc_count ? {tab: index, hits: buckets[index].doc_count} : best;
          return best;
        }, {tab: 'publications', hits: 0});
        // Redirect to tab with most results
        this.router.navigate(['results/', mostHits.tab, this.searchService.singleInput || '']);
      });
    }

}
