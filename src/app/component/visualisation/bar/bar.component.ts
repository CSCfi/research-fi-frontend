import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { ScaleLinear, scaleLinear, scaleBand, ScaleBand, axisBottom, axisLeft, max } from 'd3';

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
      this.update();
    }
  }

  update() {
    const field = 'year';
    const sample: {key: number, doc_count: number}[] = this.data.aggregations[field].buckets;

    this.svg = d3.select('svg#chart');
    this.svg.selectAll('*').remove();
    console.log(sample.map(d => d.key))

    // Clear contents


    // Init dims for svg and add top-level group
    this.g = this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
        .attr('transform', `translate(${this.margin * 2}, ${this.margin * 2})`);

    // X scale
    this.x = scaleBand()
      .range([0, this.innerWidth])
      .domain(sample.map(d => d.key.toString()).reverse())
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
          .tickFormat((a, b) => ''));
  

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
        .text('Julkaisujen määrä')

    this.g.append('text')
        .attr('x', this.innerWidth / 2 + this.margin)
        .attr('y', this.innerHeight + this.margin)
        .attr('text-anchor', 'middle')
        .text('Vuosi')

    this.g.append('text')
        .attr('x', this.innerWidth / 2 + this.margin)
        .attr('y', -this.margin / 2)
        .attr('text-anchor', 'middle')
        .text('Julkaisujen määrä vuosittain')
  }
}
