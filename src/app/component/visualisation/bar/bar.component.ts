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
  legendWidth = 350;

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
      this.innerWidth = this.width - 3 * this.margin - this.legendWidth;
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
  const longKeyCount = uniqueKeys.filter(x => x.length >= 40).length;

  // Init legend with correct height
  const legend = legendSvg
  .attr('width', this.legendWidth)
  .attr('height', (uniqueKeys.length + longKeyCount + 1) * 25)
  .append('g')
    .attr('transform', `translate(0, 0)`);

  // Init legend content groups
  const legendContent = legend.selectAll('g')
      .data(uniqueKeys)
      .enter()
      .append('g');

  let tallText = false;
  let tallCount = 0;

  // Add legend dots
  legendContent.append('circle')
                // Handle long legend strings
               .each((d, i, n) => {
                  tallText = d.length >= 50;
                  d3.select(n[i])
                    .attr('cy', this.margin / 2 + (i + tallCount) * 25 + +tallText * 25/2)
                  tallCount += +tallText;
                  tallText = false;
                })
                // Normal attributes
               .attr('cx', 10)
               .attr('r', 7)
               .attr('fill', d => color(d))
               .each((_) => {tallCount += +tallText; tallText = false; console.log(tallCount)});
  // Reset tallCount so texts align correctly
  tallCount = 0;

  // Add legend labels as foreignObjects (divs handle text wrapping natively)
  legendContent.append('foreignObject')
                // Handle long legend strings
                .each((d, i, n) => {
                  tallText = d.length >= 50;
                  d3.select(n[i])
                    .attr('y', this.margin / 2 + (i + tallCount) * 25 - 25/2)
                    .attr('height', (1 + +tallText) * 25)
                  tallCount += +tallText;
                  tallText = false;
                })
               .attr('width', this.legendWidth)
               .attr('x', 30)
               .append('xhtml:div')
               .html(d => d)

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
}
