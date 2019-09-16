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
  partition: any;
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

    // Create primary g
    this.g = d3.select('svg')
    .attr('width', this.width)
    .attr('height', this.height)
    .style('font', '10px sans-serif')
    .append('g')
    .attr('transform', 'translate(' + this.width  / 2 + ',' + this.height / 2 + ')');

    // Data structure
    this.partition = data => {
      const root = d3.hierarchy(data, d => d.values)
      .count();
      return d3.partition()
      .size([2 * Math.PI, root.height + 1])
      (root);
    };

    this.arc = d3.arc()
    .startAngle((d: any) => d.x0)
    .endAngle((d: any) => d.x1)
    .padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(this.radius * 1.5)
    .innerRadius((d: any) => d.y0 * this.radius)
    .outerRadius((d: any) => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1));

    this.getFilters();
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
    this.g.selectAll('*').remove();
    this.scrollData().subscribe((x: any) => {
      this.total = x.hits.total;
      this.nOfResults = this.total;
      const currentData = x.hits.hits;
      const scrollId = x._scroll_id;
      this.allData.push(...currentData);
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
      this.allData.push(...currentData);
      if (this.allData.length < this.total) {
        this.getNextScroll(nextScrollId);
      } else {
        const data = this.formatData(this.index);
        this.visualise(data, this.hierarchy);
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

  formatData(index: string) {
    const res = this.allData.map(x => x._source);
    switch (index) {
      case 'publication':
        res.map(x => x.fields_of_science ? x.field = x.fields_of_science.map(y => y.nameFiScience.trim())[0]
        : x.field = 'No field available');
        res.map(x => x.key = x.publicationName);
        res.map(x => x.id = x.publicationId);
        this.hierarchy = [
                          {resultField: 'publicationYear', queryField: 'year'},
                          {resultField: 'field', queryField: 'field'}
                        ];
        break;

        case 'funding':
          res.map(x => x.key = x.projectNameFi);
          res.map(x => x.id = x.projectId);
          this.hierarchy = [
                            {resultField: 'fundingStartYear', queryField: 'year'},
                            {resultField: 'funderNameFi', queryField: 'funder'}
                          ];
          break;

      default:
        break;
    }
    return res;
  }

  openResult(p) {
    this.router.navigate(['results/', this.index, p.data.id]);
  }

  searchFiltered(p) {
    const filterArray: string[] = p.ancestors().reverse().slice(1).map(d => d.data.key);
    const queryParam = {};
    this.hierarchy.forEach((e, i) => queryParam[e.queryField] = filterArray[i]);
    this.router.navigate(['results/', this.index + 's', this.searchTerm], {queryParams: queryParam});
  }

  clicked(p) {
    this.parent.datum(p.parent || this.root);
    this.nOfResults = p.value;

    this.root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = this.g.transition().duration(750);
    const arcVisible = this.arcVisible;
    const labelVisible = this.labelVisible;
    const labelTransform = this.labelTransform;

    this.path.transition(t)
      .tween('data', d => {
        const i = d3.interpolate(d.current, d.target);
        return dt => d.current = i(dt);
      })
      .filter(function(d) {
        return +this.getAttribute('fill-opacity') || arcVisible(d.target);
      })
      .attr('fill-opacity', d => arcVisible(d.target) ? (d.show ? 0.8 : 0.6) : 0)
      .attrTween('d', d => () => this.arc(d.current));

    this.label
    .filter(function(d) {
      return +this.getAttribute('fill-opacity') || labelVisible(d.target);
    })
      .transition(t)
      .attr('fill-opacity', d => +labelVisible(d.target))
      .attrTween('transform', d => () => labelTransform.bind(this)(d.current));
  }


  arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * this.radius;
    return 'rotate(' + (x - 90) + ') translate(' + y + ',0) rotate(' + (x < 180 ? 0 : 180) + ')';
  }

  visualise(allData, hierarchy) {
    let nest: any = d3.nest();
    hierarchy.forEach(field => {
      nest = nest.key(d => d[field.resultField]).sortKeys(d3.ascending);
    });
    const tree = nest.entries(allData);

    this.root = this.partition({key: 'Data', values: tree});
    const filteredChildred = this.root.descendants().slice(1).filter(d => d.children);

    this.root.each(d => d.current = d);
    this.root.each(d => d.show = d.height > 1);

    this.path = this.g.append('g')
      .selectAll('path')
      .data(filteredChildred)
      .join('path')
        .attr('fill', d => { while (d.depth > 1) { d = d.parent; } return this.color(d.data.key); })
        .attr('fill-opacity', d => this.arcVisible(d.current) ? (d.show ? 0.8 : 0.6) : 0)
        .attr('d', d => this.arc(d.current));

    this.path
      // .filter(d => d.height > 1)
      .style('cursor', 'pointer')
      .on('click', this.clicked.bind(this));

    this.path
      .filter(d => d.height === 1)
      .on('click', this.searchFiltered.bind(this));

    this.path
      .filter(d => !d.children)
      .on('click', this.openResult.bind(this));

    this.path.append('title')
      .text(d => d.ancestors().map(dd => dd.data.key).reverse().join('/'));

    this.label = this.g.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(filteredChildred)
      .join('text')
        .attr('dy', '0.35em')
        .attr('fill-opacity', d => +this.labelVisible(d.current))
        .attr('transform', d => this.labelTransform(d.current))
        .text(d => d.data.key.toString().slice(0, 20));

    this.parent = this.g.append('circle')
      .datum(this.root)
      .attr('r', this.radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', this.clicked.bind(this));

    this.loading = false;
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }
}
