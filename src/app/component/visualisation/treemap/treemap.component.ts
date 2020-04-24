import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as d3 from 'd3';
import { HierarchyNode, ScaleLinear } from 'd3';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() width;
  @Input() height;
  @Input() hierarchy;

  root: d3.HierarchyNode<any>;

  svg: d3.Selection<SVGElement, any, HTMLElement, any>;
  breadcrumb: d3.Selection<SVGElement, any, HTMLElement, any>;
  back: d3.Selection<SVGElement, any, HTMLElement, any>;

  g: d3.Selection<SVGElement, HierarchyNode<any>, SVGElement, any>;
  g1: d3.Selection<SVGElement, any, HTMLElement, any>;

  margin = {top: 30, right: 30, bottom: 30, left: 30};
  format = d3.format(',');

  transitioning = false;

  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
  color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 10 + 1));

  @Output() title: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    // Async signature fixes graph not rendering
    setTimeout(() => {
        this.initValues();
      }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange) {
      this.changesTrigger();
    }
  }

  changesTrigger() {
    this.root = this.treemap(this.data, this.hierarchy);
    this.display(this.root);
  }

  initValues() {
    // Define the hierarchy of the data, should be the same as the query fields
    // this.hierarchy = ['publicationYear', 'fields_of_science.nameFiScience.keyword'];
    // Create x and y scales
    this.x = d3.scaleLinear()
      .domain([0, this.width])
      .range([0, this.width - this.margin.left - this.margin.right]);
    this.y = d3.scaleLinear()
      .domain([0, this.height])
      .range([0, this.height]);

    // Create top-level group-element
    this.svg = d3.select('svg')
    .attr('width', this.width)
    .attr('height', this.height + this.margin.bottom + this.margin.top)
    .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .style('shape-rendering', 'crispEdges');

    // Create reference for back-button
    this.back = this.svg.append('g').attr('class', 'back');
    this.back.append('rect')
      .attr('y', this.height)
      .attr('width', 75)
      .attr('height', this.margin.bottom);
    this.back.append('text')
      .attr('x', 6)
      .attr('y', this.height + 8)
      .attr('dy', '.75em');
    // Create reference for breadcrumb-element
    this.breadcrumb = this.svg.append('g').attr('class', 'breadcrumb');
    this.breadcrumb.append('rect')
      .attr('y', -this.margin.top)
      .attr('width', this.width - this.margin.left - this.margin.right)
      .attr('height', this.margin.top);
    this.breadcrumb.append('text')
      .attr('x', 8)
      .attr('y', 8 - this.margin.top)
      .attr('dy', '.75em');
    // Create visualisation if data is available
    if (this.data) {
      this.changesTrigger();
    }
  }

  treemap(data, hierarchy) {
    // Create the root node from data and hierarchy
    const root = d3.hierarchy(data, d => {
      for (const item of hierarchy) {
        if (d[item]) {
          d['missing_' + item].key = 'Ei tietoa';
          // tslint:disable-next-line: curly
          if (!d.pushed) d[item].buckets.push(d['missing_' + item]);
          d.pushed = true;
          return d[item].buckets;
        }
      }
      return undefined;
    })
    .sum(d => Object.keys(d).length > 2 ? 0 : d.doc_count)
    .sort((a, b) => b.value - a.value);
    // Compute the treemap layout from the given root node
    return d3.treemap()
      .size([this.width, this.height])
      (root);
  }

  // A simple function that returns an empty array if the node has no children
  filterChildren(d: d3.HierarchyNode<any>) {
    return d.children || [];
  }

  // Where the magic happens
  display(d: d3.HierarchyNode<number>) {

    // Set the selected element's parent as the datum for the back-element, undefined for the root
    this.back.datum(d.parent)
      .on('click', this.transition.bind(this))
      .select('text')
      .text('Takaisin');

    this.back.select('rect')
      .attr('fill', '#e04005');

    // Hide back button on init and animation start
    this.back.attr('display', 'none');

    // Text
    this.breadcrumb.select('text')
      .text(this.breadcrumbText(d));
    // Color
    this.breadcrumb.select('rect')
      .attr('fill', '#f05010');

    // Insert the top-level group-element for data
    this.g1 = this.svg.insert('g', '.breadcrumb')
      .datum(d)
      .attr('class', 'depth');

    // Create reference to child gs
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
          .call(this.setTextVisibility.bind(this))
          .attr('class', 'foreignObj')
          .append('xhtml:div')
          .attr('dy', '.75em')
          .style('color', dd => this.contrastColor(this.color(dd.data.key)))
          .html(dd =>
            `<p class="title">${dd.data.key}</p>
             <p class="amount">${this.format(dd.value)}</p>
             <title>${dd.data.key}, ${this.format(dd.value)}</title>
            `
          )
          .attr('class', 'textdiv');

    return this.g;
  }

  transition(d) {
    // If already transitioning or at root, return
    if (this.transitioning || !d) { return; }
    this.transitioning = true;
    // Create transition for previous level
    const t1 = this.g1.transition().duration(650);
    // Get reference to new level
    const g2 = this.display(d);
    // Create transition for new level
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
    // Show back button after animation
    t2.on('end', dd => this.back.attr('display', d.parent ? 'block' : 'none'));
    this.transitioning = false;
  }

  // Show text if rectangle is big enough
  textVisible(d) {
    return ((this.y(d.y1) - this.y(d.y0)) > 40 || (this.x(d.x1) - this.x(d.x0)) > 100)
         && (this.y(d.y1) - this.y(d.y0)) * (this.x(d.x1) - this.x(d.x0)) > 3500;
  }

  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  // https://ux.stackexchange.com/questions/107318/formula-for-color-contrast-between-text-and-background
  contrastColor(c: string) {
    const arr = c.slice(4, -1).split(',');
    const lumi = arr.map(v => {
      let n = Number(v) / 255;
      n <= 0.03928 ? n = n / 12.92 : n = Math.pow(((n + 0.055) / 1.055), 2.4);
      return n;
    });
    return lumi[0] * 0.2126 + lumi[1] * 0.7152 + lumi[2] * 0.0722 <= 0.1833 ? 'white' : 'black';
  }

  setTextVisibility(d) {
    d.attr('opacity', dd => +this.textVisible(dd));
  }

  breadcrumbText(d) {
    const newTitle = d.ancestors().length > 1 ? 'Julkaisujen määrät tieteenaloittain'
                             : 'Julkaisujen määrät vuosittain';
    this.title.emit(newTitle);
    return 'Kaikki' + d.ancestors().map(dd => dd.data.key).reverse().join(' -> ');
  }

  // Methods to set attributes for different elements, called as needed

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
