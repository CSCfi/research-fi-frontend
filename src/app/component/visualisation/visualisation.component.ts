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
import { Observable } from 'rxjs';
import * as d3 from 'd3';
import { path } from 'd3';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  data: any;
  data2: Observable<any>;
  responseData: any;
  responseData2: any;
  apiUrl = this.searchService.apiUrl;
  nOfData = 100;
  levels = ['publicationYear', 'field'];

  visualToggle = false;

  width = 900;
  height = 900;
  radius = this.width / 6;
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
      const root = d3.hierarchy(data)
          .count();
          // .sum(d => d.value)
          // .sort((a, b) => b.value - a.value);
      return d3.partition()
          .size([2 * Math.PI, root.height + 1])
        (root);
    };

    this.arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(this.radius * 1.5)
      .innerRadius(d => d.y0 * this.radius)
      .outerRadius(d => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1));

    // this.fetchExampleData().subscribe(d => {this.data = d; this.visualise(d); });

    this.data = this.fetchData(this.nOfData, 0);
    // this.data2 = this.fetchData(this.nOfData, 5);

    this.data.subscribe(responseData => {
      responseData = responseData.hits.hits.map(x => x._source);
      this.responseData = responseData;
      responseData.map(x => x.fields_of_science ? x.field = x.fields_of_science.map(y => y.nameFiScience.trim()).join(', ')
                                                : x.field = 'No field available');
      responseData.map(x => x.name = x.publicationName);
      const grouped = this.formatData(responseData, this.levels[0], 0);
      grouped.children = grouped.children.map(x => x = this.formatData(x.children, this.levels[1], 1));
      this.visualise(grouped);
    });

    // this.data2.subscribe(responseData => {
    //   responseData = responseData.hits.hits.map(x => x._source);
    //   this.responseData2 = responseData;
    // });
  }

  formatData(data, field, level) {
    const newData = this.groupBy(data, field);
    return {name: level ? data[0][this.levels[level - 1]] : 'Data', children: Object.keys(newData).map(x => newData[x])};
  }

  fetchExampleData() {
    return this.http.get<Search[]>("https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json");
  }

  fetchData(size: number, from: number) {
    return this.http.get<Search[]>(this.apiUrl + 'publication/_search?size=' + size + '&from=' + from);
  }


  groupBy(data, key) { // `data` is an array of objects, `key` is the key (or property accessor) to group by
    // reduce runs this anonymous function on each element of `data` (the `item` parameter,
    // returning the `storage` parameter at the end
    return data.reduce((storage, item) =>  {
      // get the first instance of the key by which we're grouping
      const group = item[key];

      // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
      storage[group] = storage[group] || {};
      storage[group].children = storage[group].children || [];
      storage[group].name = group ? group.toString() : '';

      // add this item to its group within `storage`
      item.size = d3.randomUniform(1, 5)();
      storage[group].children.push(item);

      // return the updated storage to the reduce function, which will then loop through the next
      return storage;
        }, {}); // {} is the initial value of the storage
  }

  computeTextRotation(d) {
    const angle = 90 + (d.x0 + d.x1) / Math.PI * 90;

    return ((angle < 90 || angle > 270) ? angle : angle + 180);
  }

  arcTweenText(a, i) {
    const oi = d3.interpolate({x0: a.x0s, x1: a.x1s}, a);
    const arc = this.arc;
    const computeTextRotation = this.computeTextRotation;
    function tween(t) {
      const b = oi(t);
      return 'translate(' + arc.centroid(b) + ')rotate(' + computeTextRotation(b) + ')';
    }
    return tween;
  }

  arcTweenPath(a, i) {
    const oi = d3.interpolate({x0: a.x0s, x1: a.x1s}, a);
    const arc = this.arc;
    function tween(t) {
      const b = oi(t);
      a.x0s = b.x0;
      a.x1s = b.x1;
      return arc(b);
    }
    return tween;
  }

  switch() {
    this.clicked(d3.select('circle').data().pop());
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

  visualise(data) {
    this.root = this.partition(data);

    this.root.each(d => d.current = d);

    this.path = this.g.append('g')
      .selectAll('path')
      .data(this.root.descendants().slice(1))
      .join('path')
        .attr('fill', d => { while (d.depth > 1) { d = d.parent; } return this.color(d.data.name); })
        .attr('fill-opacity', d => this.arcVisible(d.current) ? (d.children ? 0.8 : 0.6) : 0)
        .attr('d', d => this.arc(d.current));

    this.path.filter(d => d.children)
      .style('cursor', 'pointer')
      .on('click', this.clicked.bind(this));

    this.path.append('title')
      .text(d => d.ancestors().map(d => d.data.name).reverse().join('/') + '\n' + this.format(d.value));

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
        .text(d => d.data.name.toString().slice(0, 20));

    this.parent = this.g.append('circle')
      .datum(this.root)
      .attr('r', this.radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', this.clicked.bind(this));
  }
}
