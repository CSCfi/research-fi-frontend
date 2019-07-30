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
  responseData: any;
  apiUrl = this.searchService.apiUrl;
  nOfData = 100;

  visualToggle = true;

  width = window.innerWidth;
  height = 500;
  radius = d3.min([this.width, this.height]) / 2;
  color = d3.scaleOrdinal(d3.schemeDark2);

  constructor(private searchService: SearchService, private http: HttpClient) { }

  ngOnInit() {
    this.data = this.fetchData(this.nOfData);

    this.data.subscribe(responseData => {
      responseData = responseData.hits.hits.map(x => x._source);
      this.responseData = responseData;
      // responseData.map(x => x.fields_of_science ? x.field = x.fields_of_science.map(y => y.nameFiScience.trim()).join(', ')
                                                // : x.field = 'No data');
      const grouped = this.formatData(responseData, 'publicationYear');
      console.log(grouped);
      this.visualise(grouped);
    });
  }

  formatData(data, field) {
    const newData = this.groupBy(data, field);
    return {name: 'Data', children: Object.keys(newData).map(x => newData[x])};
  }

  fetchData(n: number) {
    return this.http.get<Search[]>(this.apiUrl + 'publication/_search?size=' + n + '&from=1');
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
      storage[group].children.push(item);

      // return the updated storage to the reduce function, which will then loop through the next
      return storage;
        }, {}); // {} is the initial value of the storage
  }

  computeTextRotation(d) {
    const angle = 90 + (d.x0 + d.x1) / Math.PI * 90;

    return ((angle < 90 || angle > 270) ? angle : angle + 180);
  }

  switch() {
    const data = this.formatData(this.responseData, this.visualToggle ? 'numberOfAuthors' : 'publicationYear');
    this.visualToggle = !this.visualToggle;
    this.visualise(data);
  }

  visualise(data) {
    // Create primary g
    const g = d3.select('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', 'translate(' + this.width  / 2 + ',' + this.height / 2 + ')');

    // Data structure
    const partition = d3.partition().size([2 * Math.PI, this.radius]);

    const root = d3.hierarchy(data);

    partition(root.count());
    const arc = d3.arc()
      .startAngle(d => { d.x0s = d.x0; return d.x0 })
      .endAngle(d => { d.x1s = d.x1; return d.x1 })
      .innerRadius(d => (d as any).y0)
      .outerRadius(d => (d as any).y1);

    g.selectAll('g')
      .data(root.descendants())
      .enter().append('g').attr('class', 'node')
      .append('path')
      .attr('display', d => d.depth ? null : 'none')
      .attr('d', arc as any)
      .style('stroke', '#fff')
      .style('fill', d => this.color((d.children ? d : d.parent).data.name));

    g.selectAll('.node')
      .append('text')
      .attr('transform', d => 'translate(' + arc.centroid(d as any) + ')rotate(' + this.computeTextRotation(d) + ')')
      .attr('dx', '-20')
      .attr('dy', '5')
      .text(d => (d.children && d.parent && (d.x1 - d.x0 > 0.2)) ? d.data.name : '');
  }
}
