//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  data: any;
  errorMessage: any;

  constructor( private searchService: SearchService, private titleService: Title, @Inject(LOCALE_ID) protected localeId: string) { }

  ngOnInit() {
    this.getNews();

    // Set title
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tiede- ja tutkimusuutiset - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Science and research news - Research.fi');
        break;
      }
    }
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  getNews() {
    this.searchService.getNews()
    .pipe(map(data => [data]))
    .subscribe(data => {
      this.data = data;
    }, error => this.errorMessage = error as any);
  }

}
