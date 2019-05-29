//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  providers: [SearchBarComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  publicationData: any [];
  personData: any [];
  errorMessage = [];
  status = false;
  myOps = {
    duration: 0.5
  };

  constructor( private searchService: SearchService, private searchBar: SearchBarComponent, private titleService: Title ) {
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit() {
    // Set title
    this.setTitle('Tutkimustietovaranto');

    // Get data for count ups
    this.getPublicationData();
    this.getPersonData();

    // Reset local storage
    localStorage.removeItem('Pagenumber');
    localStorage.setItem('Pagenumber', JSON.stringify(1));
  }

  getPublicationData() {
    this.searchService.getAllPublications()
    .pipe(map(publicationData => [publicationData]))
    .subscribe(publicationData => this.publicationData = publicationData,
      error => this.errorMessage = error as any);
  }

  getPersonData() {
    this.searchService.getAllPersons()
    .pipe(map(personData => [personData]))
    .subscribe(personData => this.personData = personData,
      error => this.errorMessage = error as any);
  }

}
