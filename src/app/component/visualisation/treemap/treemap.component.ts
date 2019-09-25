import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { HierarchyNode, ScaleLinear } from 'd3';

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

  remove;

  svg: d3.Selection<SVGElement, any, HTMLElement, any>;
  breadcrumb: d3.Selection<SVGElement, any, HTMLElement, any>;
  back: d3.Selection<SVGElement, any, HTMLElement, any>;

  g: d3.Selection<SVGElement, HierarchyNode<any>, SVGElement, any>;
  g1: d3.Selection<SVGElement, any, HTMLElement, any>;

  margin = {top: 30, right: 0, bottom: 30, left: 0};
  width = 900;
  height = 600;
  format = d3.format(',');

  transitioning = false;

  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
  color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 10 + 1));

  constructor() { }

  ngOnInit() {
    // Async signature fixes graph not rendering
    setTimeout(() => {
      this.initValues();
      if (this.data) {
        this.changesTrigger();
      }
      }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange) {
      this.changesTrigger();
    }
  }

  changesTrigger() {
    this.root = this.createHierarchy(this.data, this.hierarchy);
    this.treemap(this.root
      .sum(d => Object.keys(d).length > 2 ? 0 : d.doc_count)
      .sort((a, b) => b.value - a.value));
    this.display(this.root);
  }

  initValues() {
    this.hierarchy = ['year', 'fieldOfScience'];
    this.x = d3.scaleLinear()
      .domain([0, this.width])
      .range([0, this.width]);
    this.y = d3.scaleLinear()
      .domain([0, this.height])
      .range([0, this.height]);

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

    this.back = this.svg.append('g').attr('class', 'back');
    this.back.append('rect')
      .attr('y', this.height)
      .attr('width', 75)
      .attr('height', this.margin.bottom);
    this.back.append('text')
      .attr('x', 6)
      .attr('y', this.height + 8)
      .attr('dy', '.75em');

    this.breadcrumb = this.svg.append('g').attr('class', 'breadcrumb');
    this.breadcrumb.append('rect')
      .attr('y', -this.margin.top)
      .attr('width', this.width)
      .attr('height', this.margin.top);
    this.breadcrumb.append('text')
      .attr('x', 8)
      .attr('y', 8 - this.margin.top)
      .attr('dy', '.75em');
  }

  createHierarchy(data, hierarchy) {
    const root = d3.hierarchy(data, d => {

      for (const item of hierarchy) {
        // tslint:disable-next-line: curly
        if (d[item]) return d[item].buckets;
      }
      return undefined;
    });
    return root;
  }

  filterChildren(d: d3.HierarchyNode<any>) {
    return d.children || [];
  }

  display(d: d3.HierarchyNode<number>) {

    this.back.datum(d.parent)
      .on('click', this.transition.bind(this))
      .select('text')
      .text('Takaisin');

    this.back.select('rect')
      .attr('fill', '#e04005');

    this.back.attr('display', d.parent ? 'block' : 'none');

    d.parent ? this.back.classed('on', true) : this.back.classed('on', false);

    // Text
    this.breadcrumb.select('text')
      .text(this.breadcrumbText(d));
    // Color
    this.breadcrumb.select('rect')
      .attr('fill', '#f05010');

    this.g1 = this.svg.insert('g', '.breadcrumb')
      .datum(d)
      .attr('class', 'depth');

    this.g = this.g1.selectAll('g')
      .data(dd => this.filterChildren(dd))
      .enter()
      .append('g');
    // Add click handler and class to all gs with children
    this.g.filter(dd => dd.height > 0)
          .classed('children', true)
          .on('click', this.transition.bind(this));
    // Add title to parents
    this.g.append('rect')
          .attr('class', 'parent')
          .call(this.rect.bind(this))
          .append('title')
          .text(dd => dd.data.key);
    // Add children nodes
    this.g.selectAll('.child')
          .data(dd => this.filterChildren(dd))
          .enter().append('rect')
          .attr('class', 'child')
          .call(this.outlineRect.bind(this));
    // Add foreign object to allow text wrapping
    this.g.append('foreignObject')
          .call(this.rect.bind(this))
          .attr('class', 'foreignObj')
          .append('xhtml:div')
          .attr('dy', '.75em')
          .html(dd =>
            `<p class="title">${dd.data.key}</p>
             <p>${this.format(dd.value)}</p>
             <title>${dd.data.key}, ${this.format(dd.value)}</title>
            `
          )
          .attr('class', 'textdiv');

    return this.g;
  }

  transition(d) {
    if (this.transitioning || !d) { return; }
    this.transitioning = true;
    const t1 = this.g1.transition().duration(650);
    const g2 = this.display(d);
    const t2 = g2.transition().duration(650);
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
    t2.selectAll('rect.child').call(this.outlineRect.bind(this));
    t2.selectAll('rect.parent').call(this.rect.bind(this));
    // Foreign object
    t1.selectAll('.textdiv').style('display', 'none');
    t1.selectAll('.foreignObj').call(this.foreign.bind(this));
    t2.selectAll('.textdiv').style('display', 'block');
    t2.selectAll('.foreignObj').call(this.foreign.bind(this));
    // Remove old node
    t1.on('end.remove', function() {
      this.remove();
    });
    this.transitioning = false;
  }

  textVisible(d) {
    return ((this.y(d.y1) - this.y(d.y0)) > 40 || (this.x(d.x1) - this.x(d.x0)) > 100)
         && (this.y(d.y1) - this.y(d.y0)) * (this.x(d.x1) - this.x(d.x0)) > 3500;
  }

  breadcrumbText(d) {
    return 'Kaikki' + d.ancestors().map(dd => dd.data.key).reverse().join(' -> ');
  }

  text(text) {
    text.attr('x', d => this.x(d.x))
        .attr('y', d => this.y(d.y));
  }

  rect(rect) {
    rect.attr('x', d => this.x(d.x0))
        .attr('y', d => this.y(d.y0))
        .attr('width', d => this.x(d.x1) - this.x(d.x0))
        .attr('height', d => this.y(d.y1) - this.y(d.y0))
        .attr('fill', d => this.color(d.data.key));
  }

  outlineRect(rect) {
    rect.attr('x', d => this.x(d.x0))
        .attr('y', d => this.y(d.y0))
        .attr('width', d => this.x(d.x1) - this.x(d.x0))
        .attr('height', d => this.y(d.y1) - this.y(d.y0))
        .attr('fill', d => 'rgba(0, 0, 0, 0)');
  }

  foreign(f) {
    f.attr('x', d => this.x(d.x0))
     .attr('y', d => this.y(d.y0))
     .attr('width', d => this.x(d.x1) - this.x(d.x0))
     .attr('height', d => this.y(d.y1) - this.y(d.y0))
     .attr('opacity', d => +this.textVisible(d));
  }

}
