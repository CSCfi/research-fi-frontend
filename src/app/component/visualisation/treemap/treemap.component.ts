import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements OnInit, OnChanges {
  @Input() data;

  treemap;
  hierarchy;
  root;

  svg;
  grandparent;

  margin = {top: 30, right: 30, bottom: 30, left: 30};
  width = 900;
  height = 600;
  format = d3.format(',');

  x = d3.scaleLinear()
    .domain([0, this.width])
    .range([0, this.width]);
  y = d3.scaleLinear()
    .domain([0, this.height])
    .range([0, this.height]);

  constructor() { }

  ngOnInit() {
    this.hierarchy = ['publicationYear', 'publicationTypeCode'];

    this.treemap = d3.treemap()
      .size([this.width, this.height])
      .paddingInner(0)
      .round(false);

    this.svg = d3.select('svg')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr('height', this.height + this.margin.bottom + this.margin.top)
    .style('margin-left', -this.margin.left + 'px')
    .style('margin-right', -this.margin.right + 'px')
    .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .style('shape-rendering', 'crispEdges');

    this.grandparent = this.svg.append('g').attr('class', 'grandparent');
    this.grandparent.append('rect')
      .attr('y', -this.margin.top)
      .attr('width', this.width)
      .attr('height', this.margin.top);
    this.grandparent.append('text');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange) {
      this.root = this.createHierarchy(this.data.map(x => x._source), this.hierarchy);
      this.treemap(this.root);
    }
  }

  createHierarchy(data, hierarchy) {
    let nest: any = d3.nest();
    hierarchy.forEach(key => {
      nest = nest.key(d => d[key]);
    });

    const tree = nest.entries(data);
    const root = d3.hierarchy({key: 'Data', values: tree}, d => d.values).count();
    return root;
  }

  display(data) {

  }

}
