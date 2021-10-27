//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Organization } from '@portal/models/organization.model';
import { ResizeService } from '@shared/services/resize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-organization-visualisations',
  templateUrl: './organization-visualisations.component.html',
  styleUrls: ['./organization-visualisations.component.scss'],
})
export class OrganizationVisualisationsComponent implements OnInit, OnDestroy {
  @Input() item: Organization;
  @ViewChild('iframe') iframe: ElementRef<any>;
  @ViewChildren('content') content: QueryList<ElementRef>;

  loadingTimeStamp: number = 0;
  isLoading = true;

  contentSub: Subscription;

  colWidth = 0;
  resizeSub: any;

  betaTooltip = $localize`:@@organizationVisualBetaText:Organisaatioiden tunnusluvut ovat uusi kokonaisuus Tiedejatutkimus.fi –portaalissa. Koska kyseessä on uusi kokonaisuus, toivomme palautetta tiedejatutkimus@csc.fi osoitteeseen.`;

  constructor(
    private cdr: ChangeDetectorRef,
    private resizeService: ResizeService
  ) {}

  ngOnInit(): void {
    // Handle browser resize
    this.resizeSub = this.resizeService.onResize$.subscribe(() => {
      this.onResize();
    });
  }

  onResize() {
    this.colWidth = this.content.first.nativeElement.offsetWidth;
  }

  ngAfterViewInit() {
    // Sometimes content can't be rendered fast enough so we use changes subsciption as fallback
    if (this.content && this.content.first) {
      // Timeout because this component is within an ngIf in its parent. Otherwise content width is 0.
      setTimeout(() => {
        this.colWidth = this.content.first.nativeElement.offsetWidth;
        this.cdr.detectChanges();
      }, 1);
    } else {
      // It takes some time to load data so we need to subscribe to content ref changes to get first width
      this.contentSub = this.content.changes.subscribe((item) => {
        this.colWidth = item.first.nativeElement.offsetWidth;
        this.cdr.detectChanges();
      });
    }

    // Handle iFrame loading indicator
    const handleLoad = () => (this.isLoading = false);
    this.iframe.nativeElement.addEventListener('load', handleLoad, true);
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }
}
