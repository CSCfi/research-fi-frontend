import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Inject, ViewChild, ElementRef
} from '@angular/core';
import * as d3 from 'd3v4';
import * as c from 'd3-scale-chromatic';
import {
  Visual,
  VisualData,
  VisualDataObject,
  VisualQuery,
} from 'src/app/portal/models/visualisation/visualisations.model';
import { PublicationVisual } from 'src/app/portal/models/visualisation/publication-visual.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { FundingVisual } from 'src/app/portal/models/visualisation/funding-visual.model';
import { StaticDataService } from 'src/app/portal/services/static-data.service';
import { DOCUMENT } from '@angular/common';
import { DataService } from 'src/app/portal/services/data.service';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit, OnChanges {
  
  @Input() data: Visual;
  @Input() height: number;
  @Input() width: number;
  @Input() tab: string;
  @Input() percentage: boolean;
  @Input() searchTerm: string;
  @Input() searchTarget: string;
  @Input() set saveAsImageClick(input: boolean) {
    this.firstSaveClick ? this.saveAsImage() : this.firstSaveClick = true;
  }

  firstSaveClick = false;

  @ViewChild('chart') chart: ElementRef;
  @ViewChild('legend') legend: ElementRef;
  @ViewChild('chartDownloadLinkRef') chartDownloadLinkRef: ElementRef;
  @ViewChild('legendDownloadLinkRef') legendDownloadLinkRef: ElementRef;
  chartImageUrl = '';
  legendImageUrl = '';
  svgReady = false;

  margin = 50;
  legendWidth = 350;
  shift = 5;

  innerWidth: number;
  innerHeight: number;
  Radius: number;

  g: d3.Selection<SVGElement, any, HTMLElement, any>;
  svg: d3.Selection<SVGElement, any, HTMLElement, any>;

  x: d3.ScaleBand<any>;
  y: d3.ScaleLinear<number, number>;

  @Input() visIdx: string;

  publication = this.staticDataService.visualisationData.publication;
  funding = this.staticDataService.visualisationData.funding;
  targets = this.staticDataService.targets;

  categories = this.publication;
  categoryObject: VisualQuery;

  constructor(
    private staticDataService: StaticDataService,
    @Inject(DOCUMENT) private document: Document,
    private dataService: DataService,
    private utils: UtilityService
  ) { }

  ngOnInit(): void {
    d3.formatDefaultLocale(this.staticDataService.visualisationData.locale); 
  }
    
  ngOnChanges(changes: SimpleChanges) {
    // Wait for all inputs
    if (
      (changes?.data?.currentValue || this.data) &&
      (changes?.height?.currentValue || this.height) &&
      (changes?.width?.currentValue || this.width)
    ) {
      this.update(+this.visIdx, this.percentage);
    }
  }

  saveAsImage() {
    this.chartImageUrl = this.utils.serializeSvgFromHtml(this.chart.nativeElement);

    // Legend content may be empty
    if (this.legendWidth > 0) {
      this.legendImageUrl = this.utils.serializeSvgFromHtml(this.legend.nativeElement);
    }
    this.svgReady = true;

    // Artificial timeout to wait for dom render before click
    setTimeout(() => {
      this.chartDownloadLinkRef.nativeElement.click();
      this.legendWidth > 0 ? this.legendDownloadLinkRef.nativeElement.click() : null;
    }, 100);
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
    
    // Funding amount graph is an exception
    if (this.categoryObject.field === 'amount') {
      this.legendWidth = 0;
      ylabel = 'Myönnetty summa';
      format = '$,';
    }
    
    // Data is transformed into suitable form for pie chart

    const newData = [];

    const totalData = [];
    for (let i = 0; i < sample.length; i++) {
      totalData.push(...sample[i].data.map((d) => {return {doc_count: d.doc_count}}));
    }

    const totalSum = totalData.reduce(function(a, b) {
      return a + b.doc_count;
    }, 0);

    if (this.categoryObject.field === 'year') {
      for (let i = 0; i < sample.length; i++) {
        newData.push(...sample[i].data.map((d) => {return {id: d.parent, name: d.parent, doc_count: d.doc_count, share: d.doc_count / totalSum}}));
      }
    }
    else {
      const tempData = [];

      for (let i = 0; i < sample.length; i++) {
        tempData.push(...sample[i].data.map((d) => {return {id: d.id, name: d.name, doc_count: d.doc_count, share: d.doc_count / totalSum}}));
      }
        // Objects are grouped by name
      tempData.reduce(function(d, variable) {
        if (!d[variable.name]) {
          d[variable.name] = { id: variable.id, name: variable.name, doc_count: 0, share: 0};
          newData.push(d[variable.name])
        }
        d[variable.name].doc_count += variable.doc_count;
        d[variable.name].share += variable.share;
        return d;
      }, {});
      newData.sort(function(a, b){
        return b.doc_count-a.doc_count
      })
    }

    // Height and width with margins
    this.innerHeight = this.height - 3 * this.margin;
    this.innerWidth = this.width - 3 * this.margin - this.legendWidth;
    this.Radius = Math.min(this.width, this.height) / 2;

    // Color stuff
    // Init seeding again with seedrandom
    const seedrandom = require('seedrandom');
    seedrandom('randomseed', { global: true });

    const len = newData.length;
    // Create color scale
    const color = d3.scaleOrdinal(
      // Shuffle the color order from the first onward
      UtilityService.shuffle(
        // Quantize the desired scale to the length of data
        d3.quantize(c.interpolateSinebow, d3.max([len + 1, 3])).slice(0, -1),
        1 // quantize() sets first and last element to same
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

    this.x = d3.scaleBand()
      .range([0, this.innerWidth])
      // Reverse the year to ascending domain
      .domain(sample.map((d) => d.key.toString()).reverse())
      .padding(0.2);

    const svg = d3.select("#chart"),
    width = this.width,
    height = this.height,
    radius = Math.min(width, height) / 3.5,
    g = svg.append("g").attr("transform", "translate(" + width / 4 + "," + height / 1.5 + ")");

    // Generate the pie
    const pie = d3.pie()
            .value(function(d) { return d.doc_count })
            .sort(null);

    // Generate the arcs
    const arc = d3.arc()
            .innerRadius(10)
            .outerRadius(radius)
            .cornerRadius(3);

    //Generate groups
    const arcs = g.selectAll("arc")
            .data(pie(newData))
            .enter()
            .append("g")
            .attr("class", "arc")
            .on('mouseenter', (d, i, n: any) => 
          this.showInfo(
            d,
            i,
            n,
            color
          )
        )
        // Pass percentage if selected
        .on('mouseout', (d, i, n: any) => this.hideInfo(d, i, n))
        .on('click', (d) => this.onClick(d))
            .style('cursor', (d) =>
              this.categoryObject.filter &&
              (d.id || this.categoryObject.filter === 'year')
                ? 'pointer'
                : 'default'
              )
            .append("path")
            .attr("fill", function(d, i) {
            return color(i);
      })
      .attr("d", arc);

    // Init legend with correct height
    const legend = legendSvg
      .attr('width', this.legendWidth)
      .attr('height', (newData.length + 1) * 25)
      .append('g')
      .attr('transform', "translate(0,0)");

    // Add legend dots
    legend
      .selectAll('circle')
      .data(newData)
      .enter()
      .append('circle')
      .attr('cx', 10)
      .attr('cy', (_, j) => this.margin / 2 + j * 25)
      .attr('r', 7)
      .attr("fill", function(d, i) {
        return color(i);
      })
      .on('click', (d) => this.onClickLegend(d))
      .style('cursor', this.categoryObject.filter ? 'pointer' : 'default');

       // Add legend labels
    legend
    .selectAll('text')
    .data(newData)
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
    .style('font-size', '16px')
    .html((d) => d.name)
    .on('click', (d) => this.onClickLegend(d))
    .on('mouseenter', (d, i, n) => this.increaseFontSize(i, n))
    .on('mouseout', (d, i, n) => this.decreaseFontSize(i, n))
    .style('cursor', this.categoryObject.filter ? 'pointer' : 'default');

 
    // Graph title
    this.g
      .append('text')
      .attr('x', this.margin * 2.5)
      .attr('y', -this.margin / 2)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold');
    //.text(this.categoryObject.title);

    // Search term info
    this.g
      .append('foreignObject')
      .attr('x', 0)
      .attr('y', -this.margin / 2)
      .attr('width', this.innerWidth)
      .attr('height', this.margin / 2)
      .append('xhtml:div')
      .style('text-align', 'left')
      .html(
        (this.searchTerm
          ? `"<mark>${this.searchTerm}</mark>"`
          : ``) +
          (this.searchTarget ? ', ' + this.searchTarget : '')
      );

    this.g
      .append('foreignObject')
      .attr('x', 0)
      .attr('y', -this.margin * 2 - 5)
      .attr('width', this.width - this.legendWidth - this.margin * 2)
      .attr('height', this.margin * 2)
      .append('xhtml:div')
      .style('font-size', '14px');
  }

  onClick(d: {data: {id: string; name: string; doc_count: number; share: number}, index: number; padAngle: number; startAngle: number; value: number }) {
    const filterName = this.categoryObject.filter;
    // Filter by selected arc
    setTimeout(() => {
      this.dataService.changeFilter(filterName, d.data.id);
    }, 1);
  }

  onClickLegend(d: { id: string; name: string; doc_count: number; share: number }) {
    const filterName = this.categoryObject.filter;
    // Filter by selected arc
    setTimeout(() => {
      this.dataService.changeFilter(filterName, d.id);
    }, 1);
  }

  showInfo(
    d: {data: {id: string; name: string; doc_count: number; share: number}, index: number; padAngle: number; startAngle: number; value: number },
    i: number,
    n: any[],
    color: d3.ScaleOrdinal<string, string>,
    percent?: string
  ) {
    const shift = this.shift;
    const elem: d3.Selection<
      SVGRectElement,
      VisualDataObject,
      SVGElement,
      any
    > = d3.select(n[i]);
    const x = 100;
    const y = +elem.attr('y');
    const width = +elem.attr('width');
    const height = +elem.attr('height');
    
    // Make hovered box wider
    elem
      .transition()
      .duration(300)
      .attr('x', x - shift / 2)
      .attr('width', width + shift);

    const g = d3.select('#main').append('g').style('pointer-events', 'none');

    // Add info box

    // Remove spaces and commas from name in id
    g.attr(
      'id',
      `id-${UtilityService.replaceSpecialChars(d.data.name)}`
    );

    // Append info rectangle so it's on top
    const rect = g.append('rect');
    const circle = g.append('circle');
    const circle2 = g.append('circle');

    // Append foreignObject so text width can be calculated
    const fo = g.append('foreignObject');
    fo.append('xhtml:div')
      .style('font-size', '12px')
      .style('color', 'white')
      .style('white-space', 'wrap')
      .style('width', 'max-content')
      .attr('id', 'name')
      .html(d.data.name);

    fo.append('xhtml:div')
      .style('font-size', '12px')
      .style('color', 'white')
      .style('white-space', 'nowrap')
      .style('width', 'max-content')
      .style('padding-left', '15px')
      .attr('id', 'amount')
      .html(UtilityService.thousandSeparator(d.data.doc_count.toString()));

    fo.append('xhtml:div')
      .style('font-size', '12px')
      .style('color', 'white')
      .style('white-space', 'nowrap')
      .style('width', 'max-content')
      .style('padding-left', '15px')
      .attr('id', 'share')
      .html((d.data.share * 100).toFixed(1) + '%');


    // Get the div elements to get their widths
    const nameElem: HTMLElement = this.document.querySelector('#name');
    const amountElem: HTMLElement = this.document.querySelector('#amount');
    const shareElem: HTMLElement = this.document.querySelector('#share');

    // Move rectangle so it's fully visible
    const padding = 10;
    const rectWidth =
      Math.max(nameElem.offsetWidth, amountElem.offsetWidth, shareElem.offsetWidth) + 2 * padding;
    let rectX = x + this.x.bandwidth() + padding;

    // In case it's overflowing from the right
    if (rectX + rectWidth > this.innerWidth) {
      rectX -= this.x.bandwidth() + rectWidth + 2 * padding;
    }
    // In case it now overflows from the left
    rectX = Math.max(rectX, 10);

    const rectHeight = nameElem.offsetHeight + 35;
    const rectY = Math.min(y + height / 2 - 50, this.innerHeight - rectHeight);

    // Fill in attributes based on text size
    fo.attr('x', rectX + padding)
      .attr('y', rectY + padding)
      .attr('width', rectWidth - 2 * padding)
      .attr('height', rectHeight);

    // Fill in rect and circle attributes
    rect
      .attr('x', rectX)
      .attr('y', rectY)
      .attr('width', rectWidth)
      .attr('height', rectHeight * 1.3)
      .attr('fill', 'black')
      .attr('opacity', 0.8);

    circle
      .attr('cx', rectX + padding + 5)
      .attr('cy', rectY + rectHeight - 17)
      .attr('r', 5)
      .attr('fill', color(i));

    circle2
      .attr('cx', rectX + padding + 5)
      .attr('cy', rectY + rectHeight + 2) 
      .attr('r', 5)
      .attr('fill', color(i));
  }

  hideInfo(
    d: {data: {id: string; name: string; doc_count: number; share: number}, index: number; padAngle: number; startAngle: number; value: number },
    i: number,
    n: any[]
  ) {
    const elem: d3.Selection<
      SVGRectElement,
      VisualDataObject,
      SVGElement,
      any
    > = d3.select(n[i]);

    // Restore original width
    elem
      .transition()
      .duration(300)
      .attr('x', (d) => this.x(d.data.name))
      .attr('width', this.x.bandwidth());

    // Remove info box if bar has name
    d3.select(
      `#id-${UtilityService.replaceSpecialChars(d.data.name)}`
    ).remove();
  }

  increaseFontSize(i: number, n: any[]) {
    if (this.categoryObject.filter) {

      const elem: any = d3.select(n[i]);
      
      elem
      .transition()
      .duration(300)
      .style('font-size', '18px')
      .style('margin-top', '-2px')
    }
  }

  decreaseFontSize(i: number, n: any[]) {
    const elem: any = d3.select(n[i]);

    elem
      .transition()
      .duration(300)
      .style('font-size', '16px')
      .style('margin-top', '0')
  }
}
