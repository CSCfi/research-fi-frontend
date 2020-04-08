//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/services/tab-change.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, AfterViewInit, OnDestroy {
  data: any;
  errorMessage: any;
  focusSub: any;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;

  constructor( private searchService: SearchService, private titleService: Title, @Inject(LOCALE_ID) protected localeId: string,
               private tabChangeService: TabChangeService) { }

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

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'search-input') {
        this.searchInput.nativeElement.focus();
      }
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
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

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
  }

}
