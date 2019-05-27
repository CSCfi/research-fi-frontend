//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
    @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
    status = false;
    input: string;

    constructor( private searchService: SearchService, private router: Router, private route: ActivatedRoute ) {
    }

    ngOnInit() {
      this.searchService.currentInput.subscribe(input => this.input = input);
      this.input = this.route.snapshot.params.input;
      console.log('url: ', this.route.snapshot.params.input);
    }

    increaseEvent() {
        this.status = !this.status;
    }


    newInput() {
      this.searchService.changeInput(this.publicationSearchInput.nativeElement.value);
      this.router.navigate(['/results', this.publicationSearchInput.nativeElement.value]);
      this.searchService.getInput(this.publicationSearchInput.nativeElement.value);
      this.searchService.onSearchButtonClick();
      // console.log(this.route.snapshot.params.input);
      // this.input = this.route.snapshot.params.input;
    }

    ngOnDestroy() {
      // this.inputField = '';
    }

}
