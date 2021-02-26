//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  LOCALE_ID,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../../services/search.service';
import { TabChangeService } from '../../../services/tab-change.service';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-suggest',
  templateUrl: './suggest.component.html',
  styleUrls: ['./suggest.component.scss'],
})
export class SuggestComponent implements OnInit, OnDestroy {
  suggests: any;
  responseData: any;
  errorMessage: any;
  currentTab: { data: string; label: string; link: string; icon: string };
  tabSub: any;
  inputSub: any;
  dataSub: any;
  currentInput: any;
  tabValueSub: any;

  constructor(
    private searchService: SearchService,
    public router: Router,
    private tabChangeService: TabChangeService,
    @Inject(LOCALE_ID) protected localeId: string,
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}
  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    // Subscribe to input change and get data
    this.inputSub = this.searchService.currentInput.subscribe((input) => {
      this.currentInput = input;
      this.tabSub = this.tabChangeService.currentTab.subscribe((tab) => {
        this.currentTab = tab;
      });
      this.getResultData();
    });
  }

  getResultData() {
    // Get data
    this.dataSub = this.searchService
      .getData()
      .pipe(map((responseData) => [responseData]))
      .subscribe((responseData) => {
        // ToDo: Remove outer if statement when all indices have been mapped to suggests
        if (this.currentTab.data === 'publications') {
          (this.responseData = responseData),
            // path to suggestions
            (this.suggests = this.responseData[0].suggest.mySuggestions[0]);
          // Update total & title if no hits
          if (this.responseData[0].hits.total === 0) {
            // Update total count, fixes issue where old count is visible when no results
            this.searchService.updateTotal(0);
            // Update title, same fix as above
            this.updateTitle(this.currentTab);
          }
        }
      });
  }

  updateTitle(tab) {
    // Set title by locale
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(
          tab.labelFi + ' - Ei tuloksia - Haku - Tutkimustietovaranto'
        );
        break;
      }
      case 'en': {
        this.setTitle(tab.labelEn + ' - No results - Search - Research portal');
        break;
      }
    }
  }

  navigate(term) {
    this.searchService.updateInput(term);
    this.tabValueSub = this.searchService
      .getTabValues()
      .subscribe((data: any) => {
        this.searchService.tabValues = data;
        this.searchService.redirecting = true;
        this.router.navigate(['results/', this.currentTab.data, term]);
      });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.tabSub?.unsubscribe();
      this.inputSub?.unsubscribe();
    }
  }
}
