import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements OnInit, OnChanges {
  @Input() data;

  tree;
  hierarchy;
  constructor() { }

  ngOnInit() {
    this.hierarchy = ['publicationYear', 'publicationTypeCode'];


    const treemap = d3.treemap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange) {
      console.log(this.createHierarchy(this.data.map(x => x._source), this.hierarchy));
    }
  }

  createHierarchy(data, hierarchy) {
    let nest: any = d3.nest();
    hierarchy.forEach(key => {
      nest = nest.key(d => d[key]);
    });

    const tree = nest.entries(data);
    const root = d3.hierarchy({key: 'Data', values: tree}, d => d.values).count();
    return d3.partition()(root);
  }

}
