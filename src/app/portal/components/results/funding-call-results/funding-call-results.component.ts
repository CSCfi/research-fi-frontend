import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Search } from '@portal/models/search.model';
import { HighlightSearchPipe } from '@portal/pipes/highlight.pipe';
import { SearchService } from '@portal/services/search.service';
import { SortService } from '@portal/services/sort.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';
import { TableColumn, TableRow } from 'src/types';
import { NoResultsComponent } from '../no-results/no-results.component';
import { ResultsPaginationComponent } from '../results-pagination/results-pagination.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-funding-call-results',
    templateUrl: './funding-call-results.component.html',
    styleUrls: ['./funding-call-results.component.scss'],
    imports: [
        NgIf,
        MatProgressSpinner,
        TableComponent,
        ResultsPaginationComponent,
        NoResultsComponent,
    ]
})
export class FundingCallResultsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() resultData: Search;
  @Input() sortDirection: boolean;
  @Input() sortColumn: string;
  @Input() set externalFilterQuery(externalFilterQuery: any) {}
  expandStatus: Array<boolean> = [];
  @ViewChild('main') mainContent: ElementRef;

  svgSymbolName: string = this.tabChangeService.tabData
    .filter((t) => t.data === 'fundingCalls')
    .map((t) => t.icon)
    .pop();
  input: string;
  inputSub: Subscription;
  focusSub: any;
  marginTop = 0;
  heightSub: any;

  currentLocale: string;

  tableColumns: TableColumn[];
  tableRows: Record<string, TableRow>[];
  additionalRows: ElementRef<any>[];

  @ViewChildren('categoriesColumn', { read: TemplateRef })
  categoriesColumns: QueryList<ElementRef>;

  @ViewChildren('additionalRowTemplate', { read: TemplateRef })
  additionalRowTemplates: QueryList<ElementRef>;

  dataMapped: boolean;
  iconTitleFundingCalls= $localize`:@@iconFundingCalls: Rahoitushakujen tiedon ikoni`;

  constructor(
    private route: ActivatedRoute,
    private sortService: SortService,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearchPipe
  ) {
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
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
    // Get data from templates
    const categoriesColumnArray = this.categoriesColumns.toArray();

    // Description rows
    this.additionalRows = this.additionalRowTemplates.toArray();

    // Map data to table
    // Use highlight pipe for higlighting search term
    this.tableColumns = [
      {
        key: 'name',
        label: $localize`:@@callName:Haun nimi`,
        class: 'col-4',
        mobile: true,
      },
      {
        key: 'funder',
        label: $localize`:@@fundingFunder:Rahoittaja`,
        class: 'col-3 overflow-ellipsis',
        mobile: true,
      },
      {
        key: 'callOpen',
        label: $localize`:@@callOpenDate:Haku alkaa`,
        class: 'col-2',
        mobile: false,
      },
      {
        key: 'callDue',
        label: $localize`:@@callDueDate:Haku päättyy`,
        class: 'col-2',
        mobile: false,
      },
    ];
    this.tableRows = this.resultData.fundingCalls.map((call, index) => ({
      name: {
        label: this.highlightPipe.transform(call.name, this.input),
        link: `/results/funding-call/${call.id}`,
      },
      funder: {
        label: this.highlightPipe.transform(call.foundation.name, this.input),
        ...(call.foundation.orgId && {
          link: '/results/organization/' + call.foundation.orgId,
        }),
      },
      callOpen: {
        label: call.openDate.getFullYear()
          ? call.openDateString === '01.01.1900' ? '-' : call.openDateString
          : '-',
      },
      callDue: {
        label:
          call.dueDate.getFullYear() !== 2100
            ? call.dueDateString
            : $localize`:@@continuous:Jatkuva`,
      },
    }));

    this.dataMapped = true;
  }

  isReviewed(type: string) {
    if (!type) {
      return false;
    }
    return type[0] === 'A' || type[0] === 'C';
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    this.focusSub?.unsubscribe();
    this.heightSub?.unsubscribe();
    this.inputSub?.unsubscribe();
  }
}
