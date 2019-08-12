//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { FilterService } from 'src/app/services/filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnInit {
  organizationData: any [];
  @Input() tabData: string;
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  filterSub: Subscription;
  filter: object;
  filtersOn: boolean;

  constructor( private searchService: SearchService, private filterService: FilterService ) {
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.filterSub = this.filterService.filters.subscribe(filter => {
      this.filter = filter;

      // Check if any filters are selected
      Object.keys(this.filter).forEach(key => this.filtersOn = this.filter[key].length > 0 || this.filtersOn);

      // Get data
      this.getOrganizationData();
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // Assign results to organizationData
  getOrganizationData() {
    // Get data
    this.searchService.getData()
    .pipe(map(organizationData => [organizationData]))
    .subscribe(organizationData => this.organizationData = organizationData,
               error => this.errorMessage = error as any);
  }

}
