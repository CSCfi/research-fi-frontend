//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  data: any;
  errorMessage: any;

  constructor( private searchService: SearchService) { }

  ngOnInit() {
    this.getNews();
  }

  getNews() {
    this.searchService.getNews()
    .pipe(map(data => [data]))
    .subscribe(data => {
      this.data = data;
      console.log(this.data);
    }, error => this.errorMessage = error as any);
  }

}
