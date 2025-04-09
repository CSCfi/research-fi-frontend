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
import { ActivatedRoute } from '@angular/router';
import { TabChangeService } from '@portal/services/tab-change.service';
import { Subscription } from 'rxjs';
import { UtilityService } from '@shared/services/utility.service';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { NgFor, NgClass } from '@angular/common';
import { BannerDividerComponent } from '../../../../shared/components/banner-divider/banner-divider.component';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-external-links',
    templateUrl: './external-links.component.html',
    styleUrls: ['./external-links.component.scss'],
    standalone: true,
  imports: [
    BannerDividerComponent,
    NgFor,
    DividerComponent,
    NgClass,
    MatIcon,
    SvgSpritesComponent
  ]
})
export class ExternalLinksComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('mainFocus') mainFocus: ElementRef;
  focusSub: Subscription;
  data: any;

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    private utilityService: UtilityService,
    private tabChangeService: TabChangeService,
    private route: ActivatedRoute
  ) {}

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit(): void {
    // Get data
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
        this.setTitle('Science and research elsewhere - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Vetenskap och forskning annanstans - Forskning.fi');
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
