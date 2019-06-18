//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
    @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
    public searchTerm: any;
    status = false;
    input: string;
    tabLink: any;

    constructor( private searchService: SearchService, private router: Router, private route: ActivatedRoute ) {
    }

    ngOnInit() {
    // Subscribe to route input parameter, works with browser back & forward buttons
    this.searchTerm = this.route.params.subscribe(params => {
      const term = params.input;
      this.input = term;
      this.tabLink = params.tab;
    });
    this.searchService.currentInput.subscribe(input => this.input = input);
    this.input = this.route.snapshot.params.input;
    }

    increaseEvent() {
      this.status = !this.status;
    }


    newInput() {
      this.searchService.changeInput(this.publicationSearchInput.nativeElement.value);
      this.router.navigateByUrl('/publications', {skipLocationChange: true}).then(() =>
      this.router.navigate(['results/', 'publications', this.publicationSearchInput.nativeElement.value], { queryParams: { page: 1 } }));
      this.searchService.getInput(this.publicationSearchInput.nativeElement.value);
      this.searchService.getSortMethod('desc');
      this.searchService.onSearchButtonClick();
    }

}
