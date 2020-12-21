import { Component, OnInit, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';
import * as d3 from 'd3';
import { ScaleLinear, scaleLinear, scaleBand, ScaleBand, axisBottom, axisLeft, max } from 'd3';
import { Visual, VisualData, VisualDataObject, VisualQuery } from '@portal.models/visualisation/visualisations.model';
import { PublicationVisual } from '@portal.models/visualisation/publication-visual.model';
import { UtilityService } from '@portal.services/utility.service';
import { FundingVisual } from '@portal.models/visualisation/funding-visual.model';
import { StaticDataService } from '@portal.services/static-data.service';
import { DOCUMENT } from '@angular/common';
import { DataService } from '@portal.services/data.service';

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
  @Input() searchTerm: string;
  @Input() searchTarget: string;

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

  publication = this.staticDataService.visualisationData.publication;
  funding = this.staticDataService.visualisationData.funding;
  targets = this.staticDataService.targets;

  categories = this.publication;
  categoryObject: VisualQuery;

  constructor(private staticDataService: StaticDataService, @Inject(DOCUMENT) private document: Document,
              private dataService: DataService) { }

  ngOnInit(): void {
    d3.formatDefaultLocale(this.staticDataService.visualisationData.locale);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Wait for all inputs
    if ((changes?.data?.currentValue || this.data) &&
        (changes?.height?.currentValue || this.height) &&
        (changes?.width?.currentValue || this.width)) {

      this.update(+this.visIdx, this.percentage);
    }
  }

  update(fieldIdx: number, percentage = false) {

    let visualisationData: PublicationVisual | FundingVisual;
    let ylabel = '';
    let format = ',';


    switch (this.tab) {
      case 'publications':
        visualisationData = this.data.publicationData;
        this.categories = this.publication;
        ylabel = 'Julkaisujen määrä';
        break;
      case 'fundings':
        visualisationData = this.data.fundingData;
        this.categories = this.funding;
        ylabel = 'Hankkeiden määrä';
        break;

      default:
        break;
    }

    this.categoryObject = this.categories[fieldIdx];
    const sample: VisualData[] = visualisationData[this.categoryObject.field];

    // No legend for year graph
    this.legendWidth = +this.visIdx ? 350 : 0;

    // Funding amount graph is an exception
    if (this.categoryObject.field === 'amount') {
      this.legendWidth = 0;
      ylabel = 'Myönnetty summa';
      format = '$,';
    }

    // Height and width with margins
    this.innerHeight = this.height - 3 * this.margin;
    this.innerWidth = this.width - 3 * this.margin - this.legendWidth;

    // Get the doc count of the year with the highest doc count
    const maxByDocCount = max(sample.map(x => x.data.reduce((a, b) => a + b.doc_count, 0)));

    // Color stuff
    // Init seeding again with seedrandom
    const seedrandom = require('seedrandom');
    seedrandom('randomseed', {global: true});

    const len = max(sample.map(x => x.data.length));
    // Create color scale
    const color = d3.scaleOrdinal(
      // Shuffle the color order from the first onward (year colors stay same)
      UtilityService.shuffle(
        // Quantize the desired scale to the length of data
        d3.quantize(d3.interpolateSinebow, max([len + 1, 3])).slice(0, -1), 1 // quantize() sets first and last element to same
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
        .attr('id', 'main')
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
              // Only show integer ticks
              .tickValues(this.y.ticks().filter(t => Number.isInteger(t)))
              // .tickFormat(d => d + (percentage ? '%' : '')));
              .tickFormat(percentage ? (d => d + '%') : d3.format(format)));

    // X axis
    this.g.append('g')
        .attr('transform', `translate(0, ${this.innerHeight})`)
        .call(axisBottom(this.x));

    // Add horizontal lines
    this.g.append('g')
        .attr('class', 'grid')
        .call(axisLeft(this.y)
            // Limit ticks on small amount of results
            .ticks(Math.min(5, this.y.ticks().filter(t => Number.isInteger(t)).length - 1))
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
          .on('mouseenter', (d, i, n: any) => this.showInfo(d, i, n, color, percentage ? (d.doc_count / totalSum).toFixed(1) + '%' : undefined)) // Pass percentage if selected
          .on('mouseout', (d, i, n: any) => this.hideInfo(d, i, n))
          .on('click', d => this.onClick(d))
          .style('cursor', d => (this.categoryObject.filter && (d.id || this.categoryObject.filter === 'year')) ? 'pointer' : 'default') // Pointer if filterable
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
        .style('width', '300px')
        .style('white-space', 'nowrap')
        .style('text-overflow', 'ellipsis')
        .style('overflow', 'hidden')
        .html(d => d);

    // Add axis and graph labels
    this.g.append('text')
        .attr('x', -(this.innerHeight / 2))
        .attr('y', -this.margin - 35)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle');
        // .text(ylabel);

    this.g.append('text')
        .attr('x', this.innerWidth / 2)
        .attr('y', this.innerHeight + this.margin - 5)
        .attr('text-anchor', 'middle');
        // .text('Vuosi');

    // Graph title
    this.g.append('text')
        .attr('x', this.margin * 2.5)
        .attr('y', -this.margin / 2)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold');
        // .text(this.categoryObject.title);

    // Search term info
    this.g.append('foreignObject')
        .attr('x', 0)
        .attr('y', -this.margin / 2)
        .attr('width', this.innerWidth)
        .attr('height', this.margin / 2)
        .append('xhtml:div')
          .style('text-align', 'left')
          .html((this.searchTerm ? `"<mark>${this.searchTerm}</mark>"` : $localize`:@@noSearchTerm:Ei hakusanaa`) +
                (this.searchTarget ? (', ' + this.searchTarget) : ''));

    this.g.append('foreignObject')
        .attr('x', 0)
        .attr('y', -this.margin * 2 - 5)
        .attr('width', this.width - this.legendWidth - this.margin * 2)
        .attr('height', this.margin * 2)
        .append('xhtml:div')
          .style('font-size', '14px');
          // .html(this.categoryObject.message);
  }

  onClick(d: {id: string, parent: string}) {
    const filterName = this.categoryObject.filter;

    // Only filter if a valid filter with id is available or year
    if (filterName && (d.id || filterName === 'year')) {
      // Filter by selected bar (unless year) and year
      if (d.id) {
        this.dataService.changeFilter(filterName, d.id);
      }
      setTimeout(() => {
        this.dataService.changeFilter('year', d.parent);
      }, 1);
    }
  }
  
  showInfo(d: {name: string, doc_count: number, parent: string}, i: number, n: any[], color: d3.ScaleOrdinal<string, string>, percent?: string) {
    const shift = this.shift;

    const elem: d3.Selection<SVGRectElement, VisualDataObject, SVGElement, any> = d3.select(n[i]);
    const x = +elem.attr('x');
    const y = +elem.attr('y');
    const width = +elem.attr('width');
    const height = +elem.attr('height');

    // Make hovered box wider
    elem.transition()
        .duration(300)
        .attr('x', x - shift / 2)
        .attr('width', width + shift)

    const g = d3.select('#main')
        .append('g')
        .style('pointer-events', 'none');
        
    // Add info box 

    // Remove spaces and commas from name in id
    g.attr('id', `id-${UtilityService.replaceSpecialChars(d.name || d.parent)}-${d.parent}`);

    // Append info rectangle so it's on top
    const rect = g.append('rect');
    const circle = g.append('circle');

    // Append foreignObject so text width can be calculated
    const fo = g.append('foreignObject');
    fo.append('xhtml:div')
      .style('font-size', '12px')
      .style('color', 'white')
      .style('white-space', 'wrap')
      .style('width', 'max-content')
      .attr('id', 'name')
      .html(d.name || d.parent);
    
    
    fo.append('xhtml:div')
    .style('font-size', '12px')
    .style('color', 'white')
    .style('white-space', 'nowrap')
    .style('width', 'max-content')
    .style('padding-left', '15px')
    .attr('id', 'amount')
    // Show percentage if percentage graph is chosen
    .html(percent || UtilityService.thousandSeparator(d.doc_count.toString()));
    
    // Get the div elements to get their widths
    const nameElem: HTMLElement = this.document.querySelector('#name');
    const amountElem: HTMLElement = this.document.querySelector('#amount');

    // Move rectangle so it's fully visible
    const padding = 10;
    const rectWidth = Math.max(nameElem.offsetWidth, amountElem.offsetWidth)  + 2 * padding;
    let rectX = x + this.x.bandwidth() + padding;
    
    // In case it's overflowing from the right
    if (rectX + rectWidth > this.innerWidth) {
      rectX -= this.x.bandwidth() + rectWidth + 2 * padding;
    }
    // In case it now overflows from the left
    rectX = Math.max(rectX, 10);

    const rectHeight = nameElem.offsetHeight + 35;
    const rectY = Math.min(y + (height / 2) - 50, this.innerHeight - rectHeight);


    // Fill in attributes based on text size
    fo.attr('x', rectX + padding)
      .attr('y', rectY + padding)
      .attr('width', rectWidth - 2 * padding)
      .attr('height', rectHeight);


    // Fill in rect and circle attributes
    rect.attr('x', rectX)
    .attr('y', rectY)
    .attr('width', rectWidth)
    .attr('height', rectHeight)
    .attr('fill', 'black')
    .attr('opacity', 0.8);

    circle.attr('cx', rectX + padding + 5)
    .attr('cy', rectY + rectHeight - 17)
    .attr('r', 5)
    .attr('fill', color(d.name));
    
  }

  hideInfo(d: {name: string, doc_count: number, parent: string}, i: number, n: any[]) {
    const elem: d3.Selection<SVGRectElement, VisualDataObject, SVGElement, any> = d3.select(n[i]);

    // Restore original width
    elem.transition()
        .duration(300)
        .attr('x', d => this.x(d.parent))
        .attr('width', this.x.bandwidth())

    // Remove info box if bar has name
    d3.select(`#id-${UtilityService.replaceSpecialChars(d.name || d.parent)}-${d.parent}`).remove();
  }

}
