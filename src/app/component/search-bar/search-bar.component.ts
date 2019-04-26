// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';

const API_URL = environment.apiUrl;

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, AfterViewInit {
    @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
    apiResponse: any;
    status = false;
    input: string;
    restItems: any[] = [];
    restItemsUrl = API_URL;

    constructor( private searchService: SearchService, private router: Router, private cdr: ChangeDetectorRef ) {
    }

    ngOnInit() {
      this.searchService.currentInput.subscribe(input => this.input = input);
    }

    // firstComponentFunction() {
    //   this.searchService.onFirstComponentButtonClick();
    // }

    onKeydown(event) {
      console.log(event);
    }

    increaseEvent() {
        this.status = !this.status;
    }

    newInput() {
      this.searchService.changeInput(this.publicationSearchInput.nativeElement.value);
      this.router.navigate(['/results', this.publicationSearchInput.nativeElement.value]);
      this.searchService.onSearchButtonClick();
    }

    ngAfterViewInit() {
      // //Clear input field after search button click
      // this.publicationSearchInput.nativeElement.value = '';
      // this.input = '';
      // this.cdr.detectChanges();
    }

}
