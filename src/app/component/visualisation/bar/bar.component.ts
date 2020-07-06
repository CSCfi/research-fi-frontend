import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { ScaleLinear, scaleLinear, scaleBand, ScaleBand, axisBottom, axisLeft, max } from 'd3';
import { publication } from '../categories.json'
import { Visual, VisualData } from 'src/app/models/visualisations.model';
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

      // Height and width with margins
      this.innerHeight = this.height - 3 * this.margin;
      this.innerWidth = this.width - 3 * this.margin;
      this.update(this.visIdx, this.percentage);
    }
  }

  update(fieldIdx: number, percentage = false) {

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
        .attr('width', this.width)
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
          .attr('x', _ => this.x(sample[i].key.toString()))
          .attr('fill', d => color(d.name))
          .attr('height', d => this.innerHeight - this.y(d.doc_count / (percentage ? totalSum : 1))) // Divide by total sum to get percentage, otherwise keep original
          .attr('width', _ => this.x.bandwidth())
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
  .attr('width', this.innerWidth)
  .attr('height', (uniqueKeys.length + 1) * 25)
  .append('g')
    .attr('transform', `translate(0, 0)`);

  // Add legend dots
  legend.selectAll('circle')
      .data(uniqueKeys)
      .enter()
      .append('circle')
      .attr('cx', this.margin * 2)
      .attr('cy', (_, j) => this.margin / 2 + j * 25)
      .attr('r', 7)
      .attr('fill', d=> color(d));

  // Add legend labels
  legend.selectAll('text')
      .data(uniqueKeys)
      .enter()
      .append('text')
      .attr('x', this.margin * 2 + 20)
      .attr('y', (_, j) => this.margin / 2 + j * 25)
      .attr('text-anchor', 'left')
      .style('alignment-baseline', "middle")
      .text(d => d);
   
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
        .attr('x', this.innerWidth / 2 + this.margin)
        .attr('y', -this.margin / 2)
        .attr('text-anchor', 'middle')
        .text(filterObject.title);
  }
}
