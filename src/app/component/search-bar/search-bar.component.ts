//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { AutosuggestService } from '../../services/autosuggest.service';
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
    results: any;

    constructor( public searchService: SearchService, private tabChangeService: TabChangeService,
                 public router: Router, private route: ActivatedRoute, private sortService: SortService,
                 private autosuggestService: AutosuggestService ) {
    }

    ngOnInit() {
    }

    getAutosuggest(event) {
      console.log(event.target.value);

      this.autosuggestService.search(event.target.value)
      .subscribe(results => {
        this.results = results;
      });
    }

    newInput() {
      this.sortService.sortMethod = 'desc';
      this.searchService.updatePageNumber(1);
      // Don't trigger subscriptions, just update search term
      this.searchService.singleInput = this.publicationSearchInput.nativeElement.value;

      this.searchService.getTabValues().subscribe((data: any) => {
        this.searchService.tabValues = data;
        this.searchService.redirecting = true;
        // Termporary default to publications
        this.router.navigate(['results/', this.tabChangeService.tab || 'publications', this.searchService.singleInput || '']);
      });
    }

}
