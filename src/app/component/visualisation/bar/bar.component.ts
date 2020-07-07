import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { ScaleLinear, scaleLinear, scaleBand, ScaleBand, axisBottom, axisLeft, max } from 'd3';
import { publication } from '../categories.json'
import { Visual, VisualData, VisualDataObject } from 'src/app/models/visualisations.model';
import { PublicationVisual } from 'src/app/models/publication-visual.model';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit, OnChanges {

  @Input() data: Visual;
  @Input() height: number;
  @Input() width: number;
  @Input() tab: string;
  @Input() percentage: boolean;

  margin = 50;
  legendWidth = 350;
  shift = 5;

  innerWidth: number;
  innerHeight: number;

  g: d3.Selection<SVGElement, any, HTMLElement, any>;
  svg: d3.Selection<SVGElement, any, HTMLElement, any>;

  x: ScaleBand<any>;
  y: ScaleLinear<number, number>;

  @Input() visIdx: string;

  categories = publication;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // Wait for all inputs
    if ((changes?.data?.currentValue || this.data) &&
        (changes?.height?.currentValue || this.height) &&
        (changes?.width?.currentValue || this.width)) {

      // No legend for year graph
      this.legendWidth = +this.visIdx ? 350 : 0;

      // Height and width with margins
      this.innerHeight = this.height - 3 * this.margin;
      this.innerWidth = this.width - 3 * this.margin - this.legendWidth;
      this.update(this.visIdx, this.percentage);
    }
  }

  update(fieldIdx: string, percentage = false) {

    let publicationData: PublicationVisual;

    switch (this.tab) {
      case 'publications':
        publicationData = this.data.publicationData;
        break;
    
      default:
        break;
    }

    const filterObject = this.categories[fieldIdx];
    const sample: VisualData[] = publicationData[filterObject.field];

    console.log(publicationData)
    console.log(sample)

    // Get the doc count of the year with the highest doc count
    const maxByDocCount = max(sample.map(x => x.data.reduce((a, b) => a + b.doc_count, 0)));

    // Color stuff
    const len = max(sample.map(x => x.data.length));
    // Create color scale
    const color = d3.scaleOrdinal(
      // Shuffle the color order from the first onward (year colors stay same)
      d3.shuffle(
        // Quantize the desired scale to the length of data
        d3.quantize(d3.interpolateCool, max([len, 3])), 1
        )
    );


    // Clear contents
    this.svg = d3.select('svg#chart');
    this.svg.selectAll('*').remove();
    
    
    // Init dims for svg and add top-level group
    this.g = this.svg
        .attr('width', this.width - this.legendWidth)
        .attr('height', this.height)
        .append('g')
        .attr('transform', `translate(${this.margin * 2}, ${this.margin * 2})`);
    
    // Legend init
    const legendSvg = d3.select('svg#legend');
    legendSvg.selectAll('*').remove();

    // X scale
    this.x = scaleBand()
        .range([0, this.innerWidth])
        // Reverse the year to ascending domain
        .domain(sample.map(d => d.key.toString()).reverse())
        .padding(0.2);

    // Y scale
    this.y = scaleLinear()
        .range([this.innerHeight, 0])
        .domain([0, percentage ? 100 : maxByDocCount])
        .nice(5);

    // Y axis
    this.g.append('g')
        .call(axisLeft(this.y)
              .tickFormat(d => d + (percentage ? '%' : '')));

    // X axis    
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
  
    // Keep track of all keys inserted so far
    const cumulativeKeys: string[] = [];

    // Insert bars
    for (let i = 0; i < sample.length; i++) {
      let sum = 0;
      const totalSum = sample[i].data.reduce((a, b) => a + b.doc_count, 0) / 100; // Divide by 100 to get percentages
      this.g.selectAll()
          .data(sample[i].data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => this.x(d.parent))
          .attr('fill', d => color(d.name))
          .attr('height', d => this.innerHeight - this.y(d.doc_count / (percentage ? totalSum : 1))) // Divide by total sum to get percentage, otherwise keep original
          .attr('width', _ => this.x.bandwidth())
          .on("mouseenter", (d, i, n: any) => this.showInfo(d, i, n))
          .on("mouseout", (d, i, n: any) => this.hideInfo(d, i, n))
          // Cumulative sum calculation for stacking bars
          .each((d, i, n) => {
              d3.select(n[i])
              .attr('y', (d: any) => this.y((d.doc_count + sum) / (percentage ? totalSum : 1)))
              .call((d: any) => sum += d.datum().doc_count);
          });

    // Add all the keys of the current bar
    cumulativeKeys.push(...sample[i].data.map(x => x.name))
  }

  // Create array with each unique key once
  const uniqueKeys = [... new Set(cumulativeKeys)].filter(x => x).sort();

  // Init legend with correct height
  const legend = legendSvg
  .attr('width', this.legendWidth)
  .attr('height', (uniqueKeys.length + 1) * 25)
  .append('g')
    .attr('transform', `translate(0, 0)`);

  // Add legend dots
  legend.selectAll('circle')
      .data(uniqueKeys)
      .enter()
      .append('circle')
      .attr('cx', 10)
      .attr('cy', (_, j) => this.margin / 2 + j * 25)
      .attr('r', 7)
      .attr('fill', d => color(d));

  // Add legend labels
  legend.selectAll('text')
      .data(uniqueKeys)
      .enter()
      .append('foreignObject')
      .attr('width', this.legendWidth)
      .attr('height', 25)
      .attr('x', 10 + 20)
      .attr('y', (_, j) => this.margin / 2 + j * 25 - 25 / 2)
        .append('xhtml:div')
        .style('width', '320px')
        .style('white-space', 'nowrap')
        .style('text-overflow', 'ellipsis')
        .style('overflow', 'hidden')
        .html(d => d);

    // Add axis and graph labels
    this.g.append('text')
        .attr('x', -(this.innerHeight / 2))
        .attr('y', -this.margin)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Julkaisujen määrä');

    this.g.append('text')
        .attr('x', this.innerWidth / 2)
        .attr('y', this.innerHeight + this.margin - 5)
        .attr('text-anchor', 'middle')
        .text('Vuosi');

    this.g.append('text')
        .attr('x', this.innerWidth / 2)
        .attr('y', -this.margin / 2)
        .attr('text-anchor', 'middle')
        .text(filterObject.title);

        
  }
  
  showInfo(d: {name: string, doc_count: number}, i: number, n: any[]) {
    const shift = this.shift;

    const elem: d3.Selection<SVGRectElement, VisualDataObject, SVGElement, any> = d3.select(n[i]);
    const x = +elem.attr('x');
    const y = +elem.attr('y');
    const width = +elem.attr('width');
    const height = +elem.attr('height');

    elem.transition()
        .duration(300)
        .attr('x', x - shift / 2)
        .attr('width', width + shift)

    const g = d3.select('#chart');

    console.log(this.innerHeight)
    console.log(y)
    console.log(height)

    g.append('rect')
        .attr('x', x + 200)
        .attr('y', _ => y + (height / 2))
        .attr('width', 100)
        .attr('height', 100)
        .attr('fill', 'black')
        .attr('opacity', 0.6)
  }

  hideInfo(d: {name: string, doc_count: number}, i: number, n: any[]) {
    const elem: d3.Selection<SVGRectElement, VisualDataObject, SVGElement, any> = d3.select(n[i]);

    elem.transition()
        .duration(300)
        .attr('x', d => this.x(d.parent))
        .attr('width', this.x.bandwidth())

  }

}
