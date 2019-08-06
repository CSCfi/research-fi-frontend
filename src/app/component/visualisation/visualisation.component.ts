//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { HttpClient } from '@angular/common/http';
import { Search } from 'src/app/models/search.model';
import * as d3 from 'd3';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  allData: any = [];
  apiUrl = this.searchService.apiUrl;
  total: number;
  scrollSize = 100;
  maxQueries: number;
  queriesSoFar = 0;
  loading = true;

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

  constructor(private searchService: SearchService, private http: HttpClient) { }

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
    .startAngle(d => (d as any).x0)
    .endAngle(d => (d as any).x1)
    .padAngle(d => Math.min(((d as any).x1 - (d as any).x0) / 2, 0.005))
    .padRadius(this.radius * 1.5)
    .innerRadius(d => (d as any).y0 * this.radius)
    .outerRadius(d => Math.max((d as any).y0 * this.radius, (d as any).y1 * this.radius - 1));

    this.scrollData().subscribe(x => {
      this.total = (x as any).hits.total;
      this.maxQueries = Math.min(Math.ceil(this.total / this.scrollSize), 100); // Temporary limit of 100 queries
      this.queriesSoFar++;
      const currentData = (x as any).hits.hits;
      const scrollId = (x as any)._scroll_id;
      this.allData.push(...currentData);
      if (currentData.length < this.total) {
        this.getNextScroll(scrollId);
      }
    });
  }

  fetchData(size: number, from: number) {
    return this.http.get<Search[]>(this.apiUrl + 'publication/_search?size=' + size + '&from=' + from);
  }

  scrollData() {
    const query = {
      query: {
        term: {
          _index: 'publication'
        }
      },
      size: this.scrollSize
    };
    return this.http.post(this.apiUrl + 'publication/_search?scroll=1m', query);
  }

  getNextScroll(scrollId: string) {
    this.queriesSoFar++;
    const query = {
        scroll: '1m',
        scroll_id: scrollId,
    };
    this.http.post(this.apiUrl + '_search/scroll', query).subscribe(x => {
      const currentData = (x as any).hits.hits;
      const nextScrollId = (x as any)._scroll_id;
      this.allData.push(...currentData);
      if (this.allData.length < this.total && this.queriesSoFar < this.maxQueries) {  // this.total
        this.getNextScroll(nextScrollId);
      } else {
        this.formatData();
        this.visualise(this.allData);
      }
    });
  }

  formatData() {
    this.allData = this.allData.map(x => x._source);
    this.allData.map(x => x.fields_of_science ? x.field = x.fields_of_science.map(y => y.nameFiScience.trim()).join(', ')
    : x.field = 'No field available');
    this.allData.map(x => x.key = x.publicationName);
  }

  clicked(p) {
    this.parent.datum(p.parent || this.root);

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

  visualise(allData) {
    const tree = d3.nest()
        .key(d => (d as any).publicationYear).sortKeys(d3.ascending)
        .key(d => (d as any).field)
        .entries(allData);

    this.root = this.partition({key: 'Data', values: tree});

    this.root.each(d => d.current = d);

    this.path = this.g.append('g')
      .selectAll('path')
      .data(this.root.descendants().slice(1))
      .join('path')
        .attr('fill', d => { while (d.depth > 1) { d = d.parent; } return this.color(d.data.key); })
        .attr('fill-opacity', d => this.arcVisible(d.current) ? (d.children ? 0.8 : 0.6) : 0)
        .attr('d', d => this.arc(d.current));

    this.path.filter(d => d.children)
      .style('cursor', 'pointer')
      .on('click', this.clicked.bind(this));

    this.path.append('title')
      .text(d => d.ancestors().map(dd => dd.data.key).reverse().join('/') + '\n' + this.format(d.value));

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
