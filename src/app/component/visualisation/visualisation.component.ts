//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit, OnDestroy {

  allData: any = [];
  tmpData: any = [];

  apiUrl = this.searchService.apiUrl;
  total = -1;  // Initial value to prevent NaN%
  scrollSize = 1000;
  loading = true;
  hierarchy;

  nOfResults = 0;
  searchTerm: string;
  index: string;
  queryParams: Subscription;
  filtersOn: boolean;
  filter: any;
  query: any;
  width = window.innerWidth;
  height = 900;
  radius = Math.min(this.width, this.height) / 6;
  color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 10 + 1));
  format = d3.format(',d');

  g: any;
  // partition: any;
  root: any;
  arc: any;
  chart: any;
  path: any;
  label: any;
  parent: any;

  constructor(private searchService: SearchService, private http: HttpClient, private route: ActivatedRoute,
              private filterService: FilterService, private sortService: SortService, private router: Router) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.updateInput(this.searchTerm);
    this.index = this.route.snapshot.params.tab;
    this.sortService.updateTab(this.index);
    this.index = this.index.slice(0, -1);

  }

  ngOnInit() {
    this.getFilters();
  }

  partition(data) {
    const root = d3.hierarchy(data, d => d.values)
      .count();
    return d3.partition()
      .size([2 * Math.PI, root.height + 1])
      (root);
  }

  getFilters() {
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = {year: [params.year].flat().filter(x => x),
        status: [params.status].flat().filter(x => x),
        field: [params.field].flat().filter(x => x),
        publicationType: [params.publicationType].flat().filter(x => x),
        countryCode: [params.countryCode].flat().filter(x => x),
        lang: [params.lang].flat().filter(x => x),
        juFo: [params.juFo].flat().filter(x => x),
        openAccess: [params.openAccess].flat().filter(x => x),
        internationalCollaboration: [params.internationalCollaboration].flat().filter(x => x)};

      this.filterService.updateFilters(this.filter);

      // Check if any filters are selected
      Object.keys(this.filter).forEach(key => this.filtersOn = this.filter[key].length > 0 || this.filtersOn);

      if (this.filtersOn || this.searchTerm) {
        this.filterService.updateFilters(this.filter);
        this.query = this.filterService.constructQuery(this.index, this.searchTerm);
      } else {
        this.query = undefined;
      }
      this.refreshData();
    });
  }

  refreshData() {
    if (this.index !== 'publication' && this.index !== 'funding') {
      this.loading = false;
      return;
    }
    // Clear data and visualisations
    this.allData = [];
    // this.g.selectAll('*').remove();
    this.scrollData().subscribe((x: any) => {
      this.total = x.hits.total;
      this.nOfResults = this.total;
      const currentData = x.hits.hits;
      const scrollId = x._scroll_id;
      this.tmpData.push(...currentData);
      this.getNextScroll(scrollId);   // if there is no more data, empty response
    });
  }

  scrollData() {
    this.loading = true;
    const query = {
      ...(this.query ? {query: this.query} : []),
      size: this.scrollSize
    };
    return this.http.post(this.apiUrl + this.index + '/_search?scroll=1m', query);
  }

  getNextScroll(scrollId: string) {
    const query = {
        scroll: '1m',
        scroll_id: scrollId,
    };
    this.http.post(this.apiUrl + '_search/scroll', query).subscribe((x: any) => {
      const currentData = x.hits.hits;
      const nextScrollId = x._scroll_id;
      this.tmpData.push(...currentData);
      if (this.tmpData.length < this.total) {
        this.getNextScroll(nextScrollId);
      } else {
        this.allData = this.tmpData;
        this.loading = false;
      }
    });
  }

  clearScroll(scrollId: string) {
    const payload = {
      headers: {},
      body: {
        scroll_id: scrollId
      }
    };
    return this.http.delete(this.apiUrl + '_search/scroll', payload).subscribe();
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }
}
