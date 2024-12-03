//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SingleItemService } from '../../../services/single-item.service';
import { ActivatedRoute, Router, UrlTree, UrlSegmentGroup, PRIMARY_OUTLET, UrlSegment, RouterLink } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-related-links',
    templateUrl: './related-links.component.html',
    styleUrls: ['./related-links.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        RouterLink,
    ],
})
export class RelatedLinksComponent implements OnInit, OnDestroy {
  @Input() id: any;
  @Input() filter: string;
  @Input() relatedData: any;

  relatedList = [
    {
      label: $localize`:@@publications:Julkaisut`,
      tab: 'publications',
      disabled: true,
    },
    { label: $localize`:@@authors:Tutkijat`, tab: 'persons', disabled: true },
    { label: $localize`:@@fundings:Hankkeet`, tab: 'fundings', disabled: true },
    {
      label: $localize`:@@datasets:Aineistot`,
      tab: 'datasets',
      disabled: true,
    },
    {
      label: $localize`:@@infrastructures:Infrastruktuurit`,
      tab: 'infrastructures',
      disabled: true,
    },
    {
      label: $localize`:@@organizations:Organisaatiot`,
      tab: 'organizations',
      disabled: true,
    },
  ];

  docCountData: any;
  currentParent: string;
  routeSub: Subscription;
  dataSub: Subscription;
  currentLocale: string;
  queryParams: any;

  constructor(
    private singleService: SingleItemService,
    private route: ActivatedRoute,
    private router: Router,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
    this.docCountData = [];
  }

  ngOnInit(): void {
    // Subscribe to route params, get current parent from current url
    this.routeSub = this.route.params.subscribe(() => {
      const currentUrl = this.router.url;
      const tree: UrlTree = this.router.parseUrl(currentUrl);
      const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
      const s: UrlSegment[] = g.segments;
      this.currentParent = s[1].path + 's';
      this.relatedList = this.relatedList.filter(
        (item) => item.tab !== this.currentParent
      );
    });

    // Uncomment setRelated method call when developing
    if (this.relatedData) {
      // this.setRelated();
    } else {
      if (this.id) {
        this.getDocCounts(this.id);
      }
    }
  }

  setRelated() {
    this.queryParams = {};
    if (this.relatedData?.organizations) {
      this.docCountData.organizations = {
        doc_count: this.relatedData.organizations.length,
      };
      this.relatedList.map(
        (item) =>
          (item.disabled =
            this.docCountData[item.tab]?.doc_count > 0 ? false : true)
      );

      // Set query params
      Object.assign(this.queryParams, {
        organization: this.relatedData.organizations,
      });
    }
  }

  // Get doc counts with single service getCount method, assign to to docCountData and show in appropriate counts in template
  getDocCounts(id: string) {
    this.queryParams = { [this.filter]: this.id };
    this.dataSub = this.singleService
      .getCount(this.currentParent, id, this.relatedData)
      .subscribe((data) => {
        // TODO: Remove check for currentParent
        this.docCountData = this.currentParent === 'organizations' ? data : [];
        if (this.docCountData.aggregations) {
          this.docCountData = this.docCountData?.aggregations?._index.buckets;
          // Set related list item to disabled to false if matching item has docs
          this.relatedList.map(
            (item) =>
              (item.disabled =
                this.docCountData[item.tab]?.doc_count > 0 ? false : true)
          );
        }
      });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.dataSub?.unsubscribe();
  }
}
