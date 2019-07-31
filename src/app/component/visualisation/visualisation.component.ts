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

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  data: Observable<any>;
  data2: Observable<any>;
  responseData: any;
  responseData2: any;
  apiUrl = this.searchService.apiUrl;
  nOfData = 100;

  visualToggle = false;

  width = window.innerWidth;
  height = 500;
  radius = d3.min([this.width, this.height]) / 2;
  color = d3.scaleOrdinal(d3.schemeDark2);

  g: any;
  partition: any;
  root: any;
  arc: any;
  chart: any;

  constructor(private searchService: SearchService, private http: HttpClient) { }

  ngOnInit() {

    // Create primary g
    this.g = d3.select('svg')
    .attr('width', this.width)
    .attr('height', this.height)
    .append('g')
    .attr('transform', 'translate(' + this.width  / 2 + ',' + this.height / 2 + ')');

    // Data structure
    this. partition = d3.partition().size([2 * Math.PI, this.radius]);

    this.arc = d3.arc()
      .startAngle(d => { d.x0s = d.x0; return d.x0 })
      .endAngle(d => { d.x1s = d.x1; return d.x1 })
      .innerRadius(d => (d as any).y0)
      .outerRadius(d => (d as any).y1);

    this.data = this.fetchData(this.nOfData, 0);
    this.data2 = this.fetchData(this.nOfData, 5);

    this.data.subscribe(responseData => {
      responseData = responseData.hits.hits.map(x => x._source);
      this.responseData = responseData;
      // responseData.map(x => x.fields_of_science ? x.field = x.fields_of_science.map(y => y.nameFiScience.trim()).join(', ')
                                                // : x.field = 'No data');
      const grouped = this.formatData(responseData, 'publicationYear');
      console.log(grouped);
      this.visualise(grouped);
    });

    this.data2.subscribe(responseData => {
      responseData = responseData.hits.hits.map(x => x._source);
      this.responseData2 = responseData;
    });
  }

  formatData(data, field) {
    const newData = this.groupBy(data, field);
    return {name: 'Data', children: Object.keys(newData).map(x => newData[x])};
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
    this.visualToggle = !this.visualToggle;
    // const data = this.formatData(this.visualToggle ? this.responseData2 : this.responseData, 'publicationYear');
    // this.visualise(data);
    // this.root = d3.hierarchy(data);
    this.visualToggle ? this.root.sum(d => d.size) : this.root.count();
    this.partition(this.root);

    this.chart.selectAll('path').transition().duration(750).attrTween('d', this.arcTweenPath.bind(this));
    this.chart.selectAll('text').transition().duration(750).attrTween('transform', this.arcTweenText.bind(this));
  }

  visualise(data) {
    this.root = d3.hierarchy(data).count();

    this.partition(this.root);

    this.chart = this.g.selectAll('g')
      .data(this.root.descendants(), d => d.name)
      .enter().append('g').attr('class', 'node');

    this.chart.append('path')
      .attr('display', d => d.depth ? null : 'none')
      .attr('d', this.arc as any)
      .style('stroke', '#fff')
      .style('fill', d => this.color((d.children ? d : d.parent).data.name));

    this.g.selectAll('.node')
      .append('text')
      .attr('transform', d => 'translate(' + this.arc.centroid(d as any) + ')rotate(' + this.computeTextRotation(d) + ')')
      .attr('dx', '-20')
      .attr('dy', '5')
      .text(d => (d.children && d.parent && (d.x1 - d.x0 > 0.2)) ? d.data.name : '');

    // this.chart.selectAll('path').transition().duration(750).attrTween('d', this.arcTweenPath.bind(this));
    // this.chart.selectAll('text').transition().duration(750).attrTween('transform', this.arcTweenText.bind(this));
  }
}
