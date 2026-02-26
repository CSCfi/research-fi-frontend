import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import Chart from 'chart.js/auto';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { OwsSearchService } from '@shared/services/ows-search.service';
import { BehaviorSubject } from 'rxjs';
import { pull } from 'lodash-es';
import { SimplePaginationComponent } from '@shared/components/simple-pagination/simple-pagination.component';
import { CapitalizeFirstLetterPipe } from '@shared/pipes/capitalize-first-letter.pipe';
import { MatCheckbox } from '@angular/material/checkbox';
import { Funding } from '@portal/models/funding/funding.model';
import { TrimUrlStartPipe } from '@shared/pipes/trim-url-start.pipe';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';

@Component({
  selector: 'ows-related-pie-chart',
  imports: [
    NgStyle,
    AsyncPipe,
    SimplePaginationComponent,
    CapitalizeFirstLetterPipe,
    MatCheckbox,
    TrimUrlStartPipe,
    TooltipDirective
  ],
  templateUrl: './ows-related-pie-chart.component.html',
  styleUrl: './ows-related-pie-chart.component.scss'
})
export class OwsRelatedPieChartComponent implements AfterViewInit {

  public chart: Chart;
  @ViewChild('chartRef') chartRef: ElementRef;
  public chartData: any;
  public labelData: string[] = [];
  public hitCountData: number[] = [];
  public percentageData: number[] = [];
  public colorData: string[] = [];
  public textColorData: string[] = [];
  public colorDataDimmed: string[] = [];
  public badgeSelectionData: boolean[] = [false, false, false, false, false];

  public responseDocuments: any;
  public visibleDocuments: any[];
  public filteredDocuments: any[];
  public totalHitCount = 0;
  public paginationPageSize = 5;
  public currentPageNumber = 1;

  paginationDocCount$ = new BehaviorSubject(10);

  private CATEGORYNAMES = ['article', 'blog', 'event', 'news', 'other'];
  private CATEGORYCOLORS = ['#A845B9', '#45B97B', '#1E28E6', '#F2D184', '#ED2712'];
  private CATEGORYCOLORSDIMMED = ['#D2B4D7', '#B4D7C4', '#A8ABE5', '#E8DEC7', '#E7AAA4'];
  private CATEGORYTEXTCOLORS = ['#fff', '#000', '#fff', '#000', '#fff'];

  private responseData: any;

  isDataLoaded$ = new BehaviorSubject(false);
  totalHitCountDisplay$ = new BehaviorSubject(0);
  @Input() inputData: any[];
  @Input() dataSource: string;

  constructor(private owsSearchService: OwsSearchService) {
  }

  ngAfterViewInit(): void {
    this.initCategoryData(this.dataSource, this.inputData);
  }

  initCategoryData(dataSource: string, inputData: any) {
    this.owsSearchService.postOwsSearchRequest(dataSource, inputData).then(data => {
      this.responseData = data;
      this.initChart();
    });
  }

  initChart() {
    if (this.responseData?.documents) {
      this.responseDocuments = [...this.responseData.documents];

      this.responseDocuments = this.responseDocuments.map(document => {
        document.catColor = this.getCategoryColor(document.category, false, false);
        return document;
      });
      this.visibleDocuments = [...this.responseDocuments];
    }

    if (this.responseData?.summary?.categories) {
      this.labelData = [];
      this.hitCountData = [];
      this.colorData = [];
      this.colorDataDimmed = [];
      this.textColorData = [];
      this.percentageData = [];

      this.totalHitCount = 0;
      let sortedCategories = [...this.responseData.summary.categories];
      sortedCategories = sortedCategories.sort((a, b) => {
        if (a.count > b.count) {
          return -1;
        }
        if (a.count < b.count) {
          return 1;
        }
        return 0;
      });

      sortedCategories.forEach(catItem => {
        this.labelData.push(catItem.id);
        this.hitCountData.push(catItem.count);
        this.colorData.push(this.getCategoryColor(catItem.id, false, false));
        this.colorDataDimmed.push(this.getCategoryColor(catItem.id, true, false));
        this.textColorData.push(this.getCategoryColor(catItem.id, false, true));
        this.totalHitCount += catItem.count;
        this.percentageData.push(catItem.count);
      });
      this.totalHitCountDisplay$.next(this.totalHitCount);
      this.percentageData = this.percentageData.map(item => item > 0 ? Math.round((100 / this.totalHitCount) * item * 10) / 10 : 0);
      this.filteredDocuments = [...this.responseDocuments];
      this.paginationDocCount$.next(this.filteredDocuments.length);
      this.updateChart();
    }
  }

  updateChart() {
    this.changePaginationPage(1);
    this.isDataLoaded$.next(true);
    this.paginationDocCount$.next(this.filteredDocuments.length);
    this.createChart(this.labelData, this.hitCountData, this.colorData);
  }

  isNoCategoriesSelected() {
    return this.badgeSelectionData.every(item => item === true);
  }
  isAllCategoriesSelected() {
    return this.badgeSelectionData.every(item => item === false);
  }

  // Test to prevent checkbox click problem
  onLegendCheckboxClick(value, $event) {
    if (this.badgeSelectionData[value] === false) {
      $event.target.checked = true;
    }
  }

  onLegendClick(clickIndex: number, $event: any) {
    this.chart.destroy();


    // If all categories are selected, select only one category
    if (this.isAllCategoriesSelected()) {
      for (let i = 0; i < this.badgeSelectionData.length; i++) {
        if (i !== clickIndex) {
          this.badgeSelectionData[i] = true;
          this.colorData[i] = this.getCategoryColor(this.labelData[i], this.badgeSelectionData[i], false);
        } else {
          this.badgeSelectionData[i] = false;
          this.colorData[i] = this.getCategoryColor(this.labelData[i], this.badgeSelectionData[i], false);
        }
      }
    } else {
      // Possible to select multiple categories, if one already selected
      for (let i = 0; i < this.badgeSelectionData.length; i++) {
          this.badgeSelectionData[clickIndex] = !this.badgeSelectionData[clickIndex];
          this.colorData[clickIndex] = this.getCategoryColor(this.labelData[clickIndex], this.badgeSelectionData[clickIndex], false);
        }
    }

    if (this.isNoCategoriesSelected()) {
      // Reset category colors to default, if no categories are selected
      for (let i = 0; i < this.badgeSelectionData.length; i++) {
        this.badgeSelectionData[i] = false;
        this.colorData[i] = this.getCategoryColor(this.labelData[i], this.badgeSelectionData[i], false);
      }

      // Nothing selected, reset all
      this.badgeSelectionData.map(item => item = false);
    }

    const selectedCategories = this.getSelectedCategoryNames();

    this.filteredDocuments = this.responseDocuments.filter(document => {
      return selectedCategories.some(catName => catName === document.category);
    });

    this.updateChart();
  }

  getSelectedCategoryNames() {
    let ret = [];
    for (let i = 0; i < this.badgeSelectionData.length; i++) {
      if (this.badgeSelectionData[i] === false) {
        ret.push(this.labelData[i]);
      }
    }
    return ret;
  }

  getCategoryColor(catName: string, isDimmed: boolean, isTextColor: boolean) {
    let catNum = this.CATEGORYNAMES.findIndex(elem => elem === catName);
    if (catNum !== -1) {
      if (isTextColor) {
        return this.CATEGORYTEXTCOLORS[catNum];
      } else {
        return isDimmed ? this.CATEGORYCOLORSDIMMED[catNum] : this.CATEGORYCOLORS[catNum];
      }
    } else return 'Undefined';
  }

  navigateToUrl(url: string) {
    window.open(url, '_blank');
  }

  changePaginationPage(num: number) {
    this.currentPageNumber = num;
    let startPage = (num - 1) * this.paginationPageSize;
    let endPage = startPage + this.paginationPageSize;
    this.visibleDocuments = this.filteredDocuments.slice(startPage, endPage);
  }

  createChart(labeldata: any, realdata: any, colordata: any) {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labeldata,
        datasets: [
          {
            label: ' Viittauksia',
            data: realdata,
            backgroundColor: colordata
          }
        ]
      },
      options: {
        cutout: '60%',
        animation: false,
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}

