//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  allData: any = [];
  apiUrl = this.searchService.apiUrl;
  total = -1;  // Initial value to prevent NaN%
  scrollSize = 1000;
  loading = true;
  hierarchy = ['publicationYear', 'field'];

  nOfResults = 0;
  searchTerm: string;
  index: string;
  queryParams: Subscription;
  filter: any;
  years: any;
  status: any;
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
              private filterService: FilterService, private router: Router) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.getInput(this.searchTerm);
    this.index = this.route.snapshot.params.tab;
    this.searchService.getCurrentTab(this.index);
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
      this.filter = [];
      this.filter.push([params.year].flat().filter(x => x !== undefined));

      switch (this.index) {
        case 'publication':
          this.filter.push([params.field].flat().filter(x => x !== undefined));
          break;

        case 'funding':
          this.filter.push([params.status].flat().filter(x => x !== undefined));
          break;

        default:
          break;
      }
      if (this.filter.flat() || this.searchTerm) {
        this.filterService.getFilter(this.filter);
        this.query = this.filterService.constructQuery(this.index);
      } else {
        this.query = {};
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
    const query = this.query;
    query.size = this.scrollSize;
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
        break;

        case 'funding':
          res.map(x => x.key = x.projectNameFi);
          res.map(x => x.id = x.projectId);
          this.hierarchy = ['fundingStartYear', 'fundedNameFi'];
          break;

      default:
        break;
    }
    return res;
  }

  openResult(p) {
    this.router.navigate(['results/', this.index, p.data.id]);
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
      .attr('fill-opacity', d => arcVisible(d.target) ? (d.children ? 0.8 : 0.6) : 0)
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
      nest = nest.key(d => d[field]).sortKeys(d3.ascending);
    });
    const tree = nest.entries(allData);

    this.root = this.partition({key: 'Data', values: tree});

    this.root.each(d => d.current = d);

    this.path = this.g.append('g')
      .selectAll('path')
      .data(this.root.descendants().slice(1))
      .join('path')
        .attr('fill', d => { while (d.depth > 1) { d = d.parent; } return this.color(d.data.key); })
        .attr('fill-opacity', d => this.arcVisible(d.current) ? (d.children ? 0.8 : 0.6) : 0)
        .attr('d', d => this.arc(d.current));

    this.path
      .style('cursor', 'pointer')
      .filter(d => d.children)
      .on('click', this.clicked.bind(this));

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
      .data(this.root.descendants().slice(1))
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
}
