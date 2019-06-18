//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  @Input() publicationData: any [];
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;

  constructor( private searchService: SearchService ) {
  }

  ngOnInit() {
    // Get Data
    this.getPublicationData();
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
}
