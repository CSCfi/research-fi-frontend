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


@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
    @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
    public searchTerm: any;
    input: string;
    tab: string;

    constructor( private searchService: SearchService, private tabChangeService: TabChangeService,
                 public router: Router, private route: ActivatedRoute, private sortService: SortService ) {
    }

    ngOnInit() {
      this.searchService.currentInput.subscribe(input => this.input = input);
      this.tabChangeService.currentTab.subscribe(tab => this.tab = tab.link);
    }


    newInput() {
      this.tabChangeService.directToMostHits = true;
      this.sortService.sortMethod = 'desc';
      this.searchService.updateInput(this.publicationSearchInput.nativeElement.value);
      this.router.navigate(['/results/publications', this.searchService.singleInput], { queryParams: { page: 1 } });
      this.searchService.onSearchButtonClick();
    }

}
