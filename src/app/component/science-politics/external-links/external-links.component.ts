//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  LOCALE_ID,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-external-links',
  templateUrl: './external-links.component.html',
  styleUrls: ['./external-links.component.scss'],
})
export class ExternalLinksComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainFocus') mainFocus: ElementRef;
  focusSub: Subscription;
  data: any;
  currentLocale: string;

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    private titleService: Title,
    private tabChangeService: TabChangeService,
    private route: ActivatedRoute
  ) {
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit(): void {
    // Get data
    // this.sectorData = this.route.snapshot.data.sectorData;
    this.data = this.route.snapshot.data.links;

    // Set title
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(
          'Tieteestä ja tutkimuksesta muualla - Tiedejatutkimus.fi'
        );
        break;
      }
      case 'en': {
        this.setTitle('Tieteestä ja tutkimuksesta muualla - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Tieteestä ja tutkimuksesta muualla - Forskning.fi');
        break;
      }
    }

    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.mainFocus?.nativeElement.focus();
        }
      }
    );
  }

  ngOnDestroy() {
    this.focusSub?.unsubscribe();
  }
}
