import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sunburst',
  templateUrl: './sunburst.component.html',
  styleUrls: ['./sunburst.component.scss']
})
export class SunburstComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() index;
  @Input() searchTerm;

  width = window.innerWidth;
  height = 900;
  radius = Math.min(this.width, this.height) / 6;


  arc: any;
  g: any;


  total = -1;  // Initial value to prevent NaN%
  scrollSize = 1000;
  hierarchy;

  nOfResults = 0;
  color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 10 + 1));
  format = d3.format(',d');

  root: any;
  chart: any;
  path: any;
  label: any;
  parent: any;

  constructor(private router: Router) { }

  ngOnInit() {

    // Create primary g
    this.g = d3.select('svg')
    .attr('width', this.width)
    .attr('height', this.height)
    .style('font', '10px sans-serif')
    .append('g')
    .attr('transform', 'translate(' + this.width  / 2 + ',' + this.height / 2 + ')');

    this.arc = d3.arc()
    .startAngle((d: any) => d.x0)
    .endAngle((d: any) => d.x1)
    .padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(this.radius * 1.5)
    .innerRadius((d: any) => d.y0 * this.radius)
    .outerRadius((d: any) => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange) {
      const data = this.formatData(this.index);
      this.visualise(data, this.hierarchy);
    }
  }

  partition(data) {
    const root = d3.hierarchy(data, d => d.values)
      .count();
    return d3.partition()
      .size([2 * Math.PI, root.height + 1])
      (root);
  }

  formatData(index: string) {
    const res = this.data.map(x => x._source);
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
    this.router.navigate(['results/', this.index + 's', this.searchTerm || ''], {queryParams: queryParam});
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
  }
}
