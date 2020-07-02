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

    let publicationData: PublicationVisual;

    switch (this.tab) {
      case 'publications':
        publicationData = this.data.publicationData;
        break;
    
      default:
        break;
    }

    const years = publicationData.year;

    const filterObject = this.categories[fieldIdx];
    const sample: VisualData[] = publicationData[filterObject.field];

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

    console.log(sample)

    // Clear contents
    this.svg = d3.select('svg#chart');
    this.svg.selectAll('*').remove();

    // Init dims for svg and add top-level group
    this.g = this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
        .attr('transform', `translate(${this.margin * 2}, ${this.margin * 2})`);

    // X scale
    this.x = scaleBand()
      .range([0, this.innerWidth])
      // Reverse the year to ascending domain
      .domain(years.map(d => d.key.toString()).reverse())
      .padding(0.2);

    // Y scale
    this.y = scaleLinear()
      .range([this.innerHeight, 0])
      .domain([0, maxByDocCount])
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
    for (let i = 0; i < years.length; i++) {
      let sum = 0;
      this.g.selectAll()
      .data(sample[i].data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', _ => this.x(years[i].key.toString()))
      // .attr('y', d => this.y(d.doc_count - sum))
      .attr('fill', (d: any) => color(d.name))
      .attr('height', d => this.innerHeight - this.y(d.doc_count))
      .attr('width', _ => this.x.bandwidth())
      .each((d, i, n) => {
        d3.select(n[i])
          .attr('y', (d: any) => this.y(d.doc_count + sum))
          .call((d: any) => sum += d.datum().doc_count);
      });
    }
   
    // Add axis and graph labels
    this.g.append('text')
        .attr('x', -(this.innerHeight / 2))
        .attr('y', -this.margin)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Julkaisujen määrä');

    this.g.append('text')
        .attr('x', this.innerWidth / 2 + this.margin)
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
