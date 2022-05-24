//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { SearchService } from 'src/app/portal/services/search.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { Search } from 'src/app/portal/models/search.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { TableColumn, TableRowItem } from 'src/types';
import { HighlightSearch } from '@portal/pipes/highlight.pipe';

@Component({
  selector: 'app-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss'],
})
export class FundingsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() resultData: Search;
  @ViewChild('main') mainContent: ElementRef;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  faIcon = this.tabChangeService.tabData
    .filter((t) => t.data === 'fundings')
    .map((t) => t.icon)
    .pop();
  inputSub: any;
  input: string;
  focusSub: any;

  tableColumns: TableColumn[];
  tableRows: Record<string, TableRowItem>[];

  dataMapped: boolean;

  constructor(
    private route: ActivatedRoute,
    private sortService: SortService,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearch
  ) {}

  ngOnInit() {
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
    this.inputSub = this.searchService.currentInput.subscribe((input) => {
      this.input = input;
      this.mapData();
      this.cdr.detectChanges();
    });
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
  }

  mapData() {
    // Map data to table
    // Use highlight pipe for higlighting search term
    this.tableColumns = [
      {
        key: 'name',
        label: $localize`:@@fundingName:Hankkeen nimi`,
        class: 'col-8 col-lg-5 col-xl-3',
        mobile: true,
      },
      {
        key: 'funder',
        label: $localize`:@@fundingFunder:Rahoittaja`,
        class: 'col-lg-4 col-xl-3 d-none d-lg-block',
        mobile: false,
      },
      {
        key: 'funded',
        label: $localize`:@@fundingFunded:Saaja`,
        class: 'col-xl-3 d-none d-xl-block',
        mobile: false,
      },
      {
        key: 'year',
        label: $localize`:@@fundingYear:Aloitusvuosi`,
        class: 'col-lg-auto',
        mobile: true,
      },
    ];
    this.tableRows = this.resultData.fundings.map((funding) => ({
      name: {
        label: this.highlightPipe.transform(funding.name, this.input),
        title: funding.description,
        link: `/results/funding/${funding.id}`,
      },
      funder: {
        label: this.highlightPipe.transform(
          funding.funder['nameFi'] !== 'UNDEFINED' ? funding.funder.name : '',
          this.input
        ),
      },
      funded: {
        label: this.highlightPipe.transform(
          funding.recipient.personNameAndOrg || '',
          this.input
        ),
      },
      year: {
        label: this.highlightPipe.transform(funding.startYear, this.input),
      },
    }));

    this.dataMapped = true;
  }

  ngOnDestroy() {
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.tabChangeService.targetFocus('');
  }
}
