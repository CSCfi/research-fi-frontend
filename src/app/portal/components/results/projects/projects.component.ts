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
  ChangeDetectorRef, inject, LOCALE_ID
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { SearchService } from '@portal/services/search.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { Search } from '@portal/models/search.model';
import { UtilityService } from '@shared/services/utility.service';
import { TableColumn, TableRow } from 'src/types';
import { HighlightSearchPipe } from '@portal/pipes/highlight.pipe';
import { NoResultsComponent } from '../no-results/no-results.component';
import { ResultsPaginationComponent } from '../results-pagination/results-pagination.component';
import { TableComponent } from '@shared/components/table/table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        MatProgressSpinner,
        TableComponent,
        ResultsPaginationComponent,
        NoResultsComponent,
    ],
})
export class ProjectsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() resultData: Search;
  @ViewChild('main') mainContent: ElementRef;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  faIcon: any = this.tabChangeService.tabData
    .filter((t) => t.data === 'projects')
    .map((t) => t.icon)
    .pop();
  inputSub: any;
  input: string;
  focusSub: any;

  tableColumns: TableColumn[];
  tableRows: Record<string, TableRow>[];

  dataMapped: boolean;
  projectLinkTitle = $localize`:@@iconProjects: Hankkeiden tiedon ikoni`;

  constructor(
    private route: ActivatedRoute,
    private sortService: SortService,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearchPipe
  ) {}

  ngOnInit() {
    console.log('route', this.route.snapshot.url);
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
        label: $localize`:@@spSortsProject:Hankkeen nimi`,
        class: 'col-6',
        mobile: true,
      },
      {
        key: 'organization',
        label: $localize`:@@spSortsOrganization:Organisaatio`,
        class: 'col-3',
        mobile: false,
      },
      {
        key: 'year',
        label: $localize`:@@spSortsStartYear:Aloitusvuosi`,
        class: 'col-2',
        mobile: true,
      },
    ];
    this.tableRows = this.resultData.projects.map((project) => ({
      name: {
        label: this.highlightPipe.transform(project.name, this.input),
        title: project.name,
        link: `/results/project/${project.id}`,
      },
      organization: {
        label: this.highlightPipe.transform(
          project.responsibleOrganization,
          this.input
        ),
      },
      year: {
        label: this.highlightPipe.transform(project.startYear, this.input),
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

function justOrgIfFundedBySuomenAkatemia(funding) {
  if (funding.funder.name === "Suomen Akatemia" || funding.funder.name === "Research Council of Finland" || funding.funder.name === "Finlands Akademi") {
    return funding.recipient.organizationName
  } else {
    return funding.recipient.personNameAndOrg;
  }
}
