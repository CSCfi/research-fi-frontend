//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT


import { Component, OnInit, Inject, LOCALE_ID, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-accessibility',
  templateUrl: './accessibility.component.html',
  styleUrls: ['./accessibility.component.scss']
})
export class AccessibilityComponent implements OnInit, AfterViewInit, OnDestroy {
  focusSub: Subscription;
  @ViewChild('mainFocus') mainFocus: MatCheckbox;
  title: string;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService) { }

  ngOnInit(): void {
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Saavutettavuusseloste - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        // Todo: Translate
        this.setTitle('Accessibility - Research.fi');
        break;
      }
    }
    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);

    this.title = this.getTitle();
  }

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  getTitle() {
    return this.titleService.getTitle().split('-').shift().trim();
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainFocus.focus();
      }
    });
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
  }

}
