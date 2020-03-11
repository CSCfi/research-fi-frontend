//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT


import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SingleItemService } from '../../../services/single-item.service';
import { ActivatedRoute, Router, UrlTree, UrlSegmentGroup, PRIMARY_OUTLET, UrlSegment } from '@angular/router';

@Component({
  selector: 'app-related-links',
  templateUrl: './related-links.component.html',
  styleUrls: ['./related-links.component.scss']
})
export class RelatedLinksComponent implements OnInit, OnDestroy {
  @Input() id: any;

  relatedList = [
    {labelFi: 'Julkaisut', tab: 'publications', disabled: true},
    {labelFi: 'Tutkijat', tab: 'persons', disabled: true},
    {labelFi: 'Aineistot', tab: '', disabled: true},
    {labelFi: 'Infrastruktuurit', tab: 'infrastructures', disabled: true},
    {labelFi: 'Muu tutkimustoiminta', tab: '', disabled: true},
    {labelFi: 'Organisaatiot', tab: 'organizations', disabled: true},
  ];

  docCountData: any;
  currentParent: string;
  routeSub: any;

  constructor( private singleService: SingleItemService, private route: ActivatedRoute, private router: Router ) {
    this.docCountData = [];
   }

  ngOnInit(): void {
    // Subscribe to route params, get current parent from current url
    this.routeSub = this.route.params.subscribe(param => {
      const currentUrl = this.router.url;
      const tree: UrlTree = this.router.parseUrl(currentUrl);
      const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
      const s: UrlSegment[] = g.segments;
      this.currentParent = s[1].path + 's';
    })
    this.getDocCounts(this.id);
  }

  // Get doc counts with single service getCount method, assign to to docCountData and show in appropriate counts in template
  getDocCounts(id: string) {
    this.singleService.getCount(this.currentParent, id).subscribe((data) => {
      this.docCountData = data;
      this.docCountData = this.docCountData.aggregations._index.buckets;
      console.log(this.docCountData);
      // Set related list item to disabled to false if matching item has docs
      this.relatedList.map(item => item.disabled = this.docCountData[item.tab]?.doc_count > 0 ? false : true);
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

}
