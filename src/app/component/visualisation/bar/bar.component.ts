import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { ScaleLinear, scaleLinear, scaleBand, ScaleBand, axisBottom, axisLeft, max } from 'd3';
import { publication } from '../categories.json'

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit, OnChanges {

  @Input() data: any;
  @Input() height: number;
  @Input() width: number;

  margin = 50;

  innerWidth: number;
  innerHeight: number;

  g: d3.Selection<SVGElement, any, HTMLElement, any>;
  svg: d3.Selection<SVGElement, any, HTMLElement, any>;

  x: ScaleBand<any>;
  y: ScaleLinear<number, number>;

  @Input() visIdx: number;

  categories = publication;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // Wait for all inputs
    if ((changes?.data?.currentValue || this.data) && 
        (changes?.height?.currentValue || this.height) &&
        (changes?.width?.currentValue || this.width)) {
      console.log(this.data)
      // Height and width with margins
      this.innerHeight = this.height - 3 * this.margin;
      this.innerWidth = this.width - 3 * this.margin;
      this.update(this.visIdx);
    }
  }

  update(fieldIdx: number) {
    console.log(fieldIdx)
    const filterObject = this.categories[fieldIdx];
    const sample: {key: number, doc_count: number}[] = this.data.aggregations[filterObject.field].buckets;
    console.log(sample)

    // Clear contents
    this.svg = d3.select('svg#chart');
    this.svg.selectAll('*').remove();
    console.log(sample.map(d => d[filterObject.label]))

    console.log(sample[0].doc_count)

    // Init dims for svg and add top-level group
    this.g = this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
        .attr('transform', `translate(${this.margin * 2}, ${this.margin * 2})`);

    // X scale
    const xDomain = sample.map(d => d[filterObject.label].toString());
    this.x = scaleBand()
      .range([0, this.innerWidth])
      // Reverse the domain if necessary (years etc)
      .domain(filterObject.reverse ? xDomain.reverse() : xDomain)
      .padding(0.2);

    // Y scale
    this.y = scaleLinear()
      .range([this.innerHeight, 0])
      .domain([0, max(sample.map(d => d.doc_count))])
      .nice(5);

    // X axis
    this.g.append('g')
      .call(axisLeft(this.y));

    // Y axis    
    this.g.append('g')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(axisBottom(this.x));

    // Add horizontal lines
    this.g.append('g')
      .attr('class', 'grid')
      .call(axisLeft(this.y)
          .ticks(5)
          .tickSize(-this.innerWidth)
          .tickFormat((_, __) => ''));
  

    // Insert bars
    this.g.selectAll()
      .data(sample)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.x(d.key))
      .attr('y', d => this.y(d.doc_count))
      .attr('height', d => this.innerHeight - this.y(d.doc_count))
      .attr('width', d => this.x.bandwidth());
   
    // Add axis and graph labels
    this.g.append('text')
        .attr('x', -(this.innerHeight / 2))
        .attr('y', -this.margin)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(filterObject.yLabel);

    this.g.append('text')
        .attr('x', this.innerWidth / 2 + this.margin)
        .attr('y', this.innerHeight + this.margin - 5)
        .attr('text-anchor', 'middle')
        .text(filterObject.xLabel);

    this.g.append('text')
        .attr('x', this.innerWidth / 2 + this.margin)
        .attr('y', -this.margin / 2)
        .attr('text-anchor', 'middle')
        .text(filterObject.title);
  }
}
