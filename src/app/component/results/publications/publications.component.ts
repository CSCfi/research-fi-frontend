//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../../services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  @Input() publicationData: any [];
  expandStatus: Array<boolean> = [];
  public searchTerm: any;
  fromPage = 0;
  pageNumber = 1;
  page = 1;
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  paginationCheck: boolean;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private router: Router, private titleService: Title ) {
    this.searchTerm = this.route.snapshot.params.input;

    // Check if http request is POST or GET
    this.paginationCheck = this.searchService.requestCheck;
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    // Reset pagination
    this.page = this.searchService.pageNumber;

    // Pagination number
    this.fromPage = this.page * 10 - 10;

  }

  // Assign results to publicationData
  getPublicationData() {
    this.searchService.getPublications()
    .pipe(map(publicationData => [publicationData]))
    .subscribe(publicationData => {
      this.publicationData = publicationData;
    },
      error => this.errorMessage = error as any);
  }

  nextPage() {
    this.page++;
    this.fromPage = this.page * 10 - 10;
    // Send to search service
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.router.navigate(['results/', this.searchTerm], { queryParams: { page: this.page } });
    this.getPublicationData();
    this.paginationCheck = true;
  }

  previousPage() {
    this.page--;
    this.fromPage = this.fromPage - 10;
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    this.router.navigate(['results/', this.searchTerm], { queryParams: { page: this.page } });
    // If going back to first page, getAllResults does POST request
    if (this.page === 1) {
      this.paginationCheck = false;
      this.searchService.getAllResults()
      .pipe(map(publicationData => [publicationData]))
      .subscribe(publicationData => {
        this.publicationData = publicationData;
      });
    } else {
      this.paginationCheck = true;
      this.getPublicationData();
    }
  }

  updateTitle(event: { tab: any; }) {
    // Update title and <h1> with the information of the currently selected tab
    // Regex to match the bracketed numbers
    const re: RegExp = /\((\d*)\)/;
    this.setTitle(event.tab.textLabel.replace(re, ' - ($1 hakutulosta)') + ' - Haku - Tutkimustietovaranto');
    this.srHeader.nativeElement.innerHTML = document.title.split(' - ', 2).join(' - ');
  }

}
