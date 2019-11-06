//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  providers: [SearchBarComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  allData: any [];
  errorMessage = [];
  status = false;
  myOps = {
    duration: 0.5
  };
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;

  basicStyle = {
    border: '0px',
    background: 'white',
    margin: '6px 0 4px',
    // padding: '4px 8px 4px 12px',
    'min-width': '200px'
  };

  constructor( private searchService: SearchService, private sortService: SortService, private searchBar: SearchBarComponent,
               private titleService: Title, @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object ) { }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit() {
    // Reset search term
    this.searchService.updateInput('');

    // Get data for count-ups
    this.getAllData();

    // Reset sort
    this.sortService.updateSort('');

    // Set title
    this.setTitle('Etusivu - Tutkimustietovaranto');
    this.srHeader.nativeElement.innerHTML = this.document.title.split(' - ', 1);

    // Reset local storage
    // if (isPlatformBrowser(this.platformId)) {
    //   localStorage.removeItem('Pagenumber');
    //   localStorage.setItem('Pagenumber', JSON.stringify(1));
    // }
  }

  getAllData() {
    this.searchService.getAllResultCount()
    .pipe(map(allData => [allData]))
    .subscribe(allData => this.allData = allData,
      error => this.errorMessage = error as any);
  }
}
