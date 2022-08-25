import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HighlightSearch } from '@portal/pipes/highlight.pipe';
import { Search } from 'src/app/portal/models/search.model';
import { SearchService } from 'src/app/portal/services/search.service';
import { SortService } from 'src/app/portal/services/sort.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { TableColumn, TableRowItem } from 'src/types';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss'],
})
export class DatasetsComponent implements OnInit {
  @Input() resultData: Search;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  @ViewChild('main') mainContent: ElementRef;

  faIcon = this.tabChangeService.tabData
    .filter((t) => t.data === 'datasets')
    .map((t) => t.icon)
    .pop();
  documentLang: any;
  input: string;
  inputSub: any;
  focusSub: any;
  marginTop = 0;
  heightSub: any;

  tableColumns: TableColumn[];
  tableRows: Record<string, TableRowItem>[];

  @ViewChildren('datasetNameColumn', { read: TemplateRef })
  datasetNameColumns: QueryList<ElementRef>;

  @ViewChildren('datasetTagsColumn', { read: TemplateRef })
  datasetTagsColumns: QueryList<ElementRef>;

  dataMapped: boolean;
  iconTitleDatasets= $localize`:@@iconDatasets: Tutkimusaineistojen tiedon ikoni`;

  constructor(
    private route: ActivatedRoute,
    private sortService: SortService,
    @Inject(DOCUMENT) private document: any,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearch
  ) {
    this.documentLang = this.document.documentElement.lang;
  }

  ngOnInit() {
    // Check url for sorting, default to empty
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
  }

  ngAfterViewInit() {
    // Focus first element when clicked with skip-link
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main') {
          this.mainContent?.nativeElement.focus();
        }
      }
    );

    this.inputSub = this.searchService.currentInput.subscribe((input) => {
      this.input = input;
      this.mapData();
      this.cdr.detectChanges();
    });
  }

  mapData() {
    const nameColumnArray = this.datasetNameColumns.toArray();
    const tagColumnArray = this.datasetTagsColumns.toArray();

    // Map data to table
    // Use highlight pipe for higlighting search term
    this.tableColumns = [
      {
        key: 'name',
        label: $localize`:@@datasetName:Tutkimusaineiston nimi`,
        class: 'col-8 col-lg-5 col-xl-4',
        mobile: true,
      },
      {
        key: 'creators',
        label: $localize`:@@datasetCreators:Tutkimusaineiston tekijät / organisaatio`,
        class: 'col-lg-5 col-xl-3 d-none d-lg-block',
        mobile: false,
      },
      {
        key: 'year',
        label: $localize`:@@year:Vuosi`,
        class: 'col-lg-1',
        mobile: true,
      },
      {
        key: 'tags',
        class: 'col-lg-3 d-none d-xl-block',
        mobile: false,
        sortDisabled: true,
        overflowEnabled: true,
      },
    ];

    this.tableRows = this.resultData.datasets.map((dataset, index) => ({
      name: {
        template: nameColumnArray[index],
        link: `/results/dataset/${dataset.id}`,
      },
      creators: {
        label: this.highlightPipe.transform(dataset.creators, this.input),
      },
      year: {
        label: this.highlightPipe.transform(dataset.year, this.input),
      },
      tags: {
        template: tagColumnArray[index],
      },
    }));

    this.dataMapped = true;
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
  }
}
