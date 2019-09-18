import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { HierarchyNode } from 'd3';
import { HtmlAstPath } from '@angular/compiler';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements OnInit, OnChanges {
  @Input() data;

  treemap: d3.TreemapLayout<any>;
  hierarchy;
  root: d3.HierarchyNode<any>;

  svg: d3.Selection<SVGElement, any, HTMLElement, any>;
  grandparent: d3.Selection<SVGElement, any, HTMLElement, any>;

  g: d3.Selection<SVGElement, HierarchyNode<any>, SVGElement, any>;
  g1: d3.Selection<SVGElement, any, HTMLElement, any>;

  margin = {top: 30, right: 30, bottom: 30, left: 30};
  width = 900;
  height = 600;
  format = d3.format(',');

  transitioning = false;

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
      console.log(this.root);
      this.treemap(this.root);
      this.display(this.root);
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

  display(d: d3.HierarchyNode<number>) {
    this.grandparent.datum(d.parent)
      .on('click', this.transition.bind(this))
      .select('text')
      .text('Back');
    // Color
    this.grandparent.datum(d.parent)
      .select('rect')
      .attr('fill', dd => '#ff0000');

    this.g1 = this.svg.insert('g', '.grandparent')
      .datum(d)
      .attr('class', 'depth');

    this.g = this.g1.selectAll('g')
      .data(d.children.filter(dd => dd.children))
      .enter()
      .append('g');
    // Add click handler and class to all gs with children
    this.g.filter(dd => dd.height > 1)  // && true to fix typescript error
          .classed('children', true)
          .on('click', this.transition.bind(this));
    this.g.selectAll('.child')
          .data(dd => dd.children || [dd])
          .enter().append('rect')
          .attr('class', 'child')
          .call(this.rect.bind(this));
    // Add title to parents
    this.g.append('rect')
          .attr('class', 'parent')
          .call(this.rect.bind(this))
          .append('title')
          .text(dd => dd.data.key);
    // Add foreign object to allow text wrapping
    this.g.append('foreignObject')
          .call(this.rect.bind(this))
          .attr('class', 'foreignObj')
          .append('xhtml:div')
          .attr('dy', '.75em')
          .html(dd =>
            `<p class="title">${dd.data.key}</p>
             <p> ${this.format(dd.value)}</p>
            `
          )
          .attr('class', 'textdiv');

    return this.g;
  }

  transition(d) {
    if (this.transitioning || !d) { return; }
    this.transitioning = true;
    const g2 = this.display(d);
    const t1 = this.g1.transition().duration(650);
    const t2 =      g2.transition().duration(650);
    // Update domain
    this.x.domain([d.x0, d.x1]);
    this.y.domain([d.y0, d.y1]);
    // Anti-aliasing
    this.svg.style('shape-rendering', null);
    // Draw children
    this.svg.selectAll('.depth').sort((a: any, b: any) => a.depth - b.depth);
    // Fade-in entering text
    g2.selectAll('text').style('fill-opacity', 0);
    g2.selectAll('foreignObject div').style('display', 'none');
    // Transition to new view
    t1.selectAll('text').call(this.text.bind(this)).style('fill-opacity', 0);
    t2.selectAll('text').call(this.text.bind(this)).style('fill-opacity', 1);
    t1.selectAll('rect').call(this.rect.bind(this));
    t2.selectAll('rect').call(this.rect.bind(this));
    // Foreign object
    t1.selectAll('.textdiv').style('display', 'none');
    t1.selectAll('.foreignObj').call(this.foreign.bind(this));
    t1.selectAll('.textdiv').style('display', 'block');
    t1.selectAll('.foreignObj').call(this.foreign.bind(this));
    // Remove old node
    t1.on('end.remove', function() {
      console.log(this.parentElement.children);
      this.parentElement.children[0].remove();
    });
    this.transitioning = false;
  }

  text(text) {
    text.attr('x', d => this.x(d.x) + 6)
        .attr('y', d => this.y(d.y) + 6);
  }

  rect(rect) {
    rect.attr('x', d => this.x(d.x0) + 6)
        .attr('y', d => this.y(d.y0) + 6)
        .attr('width', d => this.x(d.x1) - this.x(d.x0))
        .attr('height', d => this.y(d.y1) - this.y(d.y0))
        .attr('fill', d => '#dddddd');
      }

  foreign(f) {
    f.attr('x', d => this.x(d.x0))
     .attr('y', d => this.y(d.y0))
     .attr('width', d => this.x(d.x1) - this.x(d.x0))
     .attr('height', d => this.y(d.y1) - this.y(d.y0));
  }

}
