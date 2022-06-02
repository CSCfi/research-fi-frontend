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
import { HighlightSearch } from '@portal/pipes/highlight.pipe';
import { SearchService } from '@portal/services/search.service';
import { SortService } from '@portal/services/sort.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';
import { TableColumn, TableRowItem } from 'src/types';

@Component({
  selector: 'app-funding-call-results',
  templateUrl: './funding-call-results.component.html',
  styleUrls: ['./funding-call-results.component.scss'],
})
export class FundingCallResultsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() resultData: Search;
  @Input() sortDirection: boolean;
  @Input() sortColumn: string;
  @Input() set externalFilterQuery(externalFilterQuery: any) {
  }
  expandStatus: Array<boolean> = [];
  @ViewChild('main') mainContent: ElementRef;

  faIcon = this.tabChangeService.tabData
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
  tableRows: Record<string, TableRowItem>[];
  additionalRows: ElementRef<any>[];

  @ViewChildren('categoriesColumn', { read: TemplateRef })
  categoriesColumns: QueryList<ElementRef>;

  @ViewChildren('additionalRowTemplate', { read: TemplateRef })
  additionalRowTemplates: QueryList<ElementRef>;

  dataMapped: boolean;

  constructor(
    private route: ActivatedRoute,
    private sortService: SortService,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearch
  ) {
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit() {
    // Check url for sorting, default to empty
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
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
          ? this.highlightPipe.transform(call.openDateString, this.input)
          : '-',
      },
      callDue: {
        label:
          call.dueDate.getFullYear() !== 2100
            ? this.highlightPipe.transform(call.dueDateString, this.input)
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
