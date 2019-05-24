//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { StringifyOptions } from 'querystring';


@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
    @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
    status = false;
    input: string;
    inputField: string;

    constructor( private searchService: SearchService, private router: Router ) {
    }

    ngOnInit() {
      this.searchService.currentInput.subscribe(input => this.input = input);
    }

    increaseEvent() {
        this.status = !this.status;
    }

    // clear() {

    // }

    newInput() {
      this.searchService.changeInput(this.publicationSearchInput.nativeElement.value);
      this.router.navigate(['/results', this.publicationSearchInput.nativeElement.value]);
      this.searchService.getInput(this.publicationSearchInput.nativeElement.value);
      this.searchService.onSearchButtonClick();
    }

    ngOnDestroy() {
      this.inputField = '';
    }

}
