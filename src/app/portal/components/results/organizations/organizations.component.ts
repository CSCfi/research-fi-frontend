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
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { SearchService } from 'src/app/portal/services/search.service';
import { SortService } from 'src/app/portal/services/sort.service';
import { Search } from 'src/app/portal/models/search.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { HighlightSearchPipe } from '@portal/pipes/highlight.pipe';
import { TableColumn, TableRow } from 'src/types';
import { NoResultsComponent } from '../no-results/no-results.component';
import { ResultsPaginationComponent } from '../results-pagination/results-pagination.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-organizations',
    templateUrl: './organizations.component.html',
    styleUrls: ['./organizations.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        MatProgressSpinner,
        TableComponent,
        ResultsPaginationComponent,
        NoResultsComponent,
    ],
})
export class OrganizationsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  _resd: Search;
  get resultData(): Search {
    return this._resd;
  }

  @Input() set resultData(resD: Search) {
    this._resd = resD;
  }
  @ViewChild('main') mainContent: ElementRef;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  svgSymbolName: string = this.tabChangeService.tabData
    .filter((t) => t.data === 'organizations')
    .map((t) => t.icon)
    .pop();

  inputSub: any;
  input: string;
  focusSub: any;
  tableColumns: TableColumn[];
  tableRows: Record<string, TableRow>[];
  iconTitleOrganizations = $localize`:@@iconOrganizations: Organisaatioiden tiedon ikoni`;

  constructor(
    private route: ActivatedRoute,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private sortService: SortService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearchPipe
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

  mapData() {
    // Map data to table
    // Use highlight pipe for higlighting search term
    this.tableColumns = [
      {
        key: 'name',
        label: $localize`:@@name:Nimi`,
        class: 'col-7',
        mobile: true,
      },
      {
        key: 'sector',
        label: $localize`:@@orgOrganization:Organisaatio`,
        class: 'col-4',
        mobile: true,
      },
    ];
    this.tableRows = this.resultData.organizations.map((organization) => ({
      name: {
        label: this.highlightPipe.transform(organization.name, this.input),
        link: `/results/organization/${organization.id}`,
      },
      sector: {
        label: this.highlightPipe.transform(
          organization.sectorName,
          this.input
        ),
      },
    }));
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

  ngOnDestroy() {
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.tabChangeService.targetFocus('');
  }
}
