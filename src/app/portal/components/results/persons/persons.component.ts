//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input, OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { Search } from '@portal/models/search.model';
import { HighlightSearchPipe } from '@portal/pipes/highlight.pipe';
import { SearchService } from '@portal/services/search.service';
import { SortService } from '@portal/services/sort.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { Subscription } from 'rxjs';
import { TableColumn, TableRow } from 'src/types';
import { UtilityService } from '@shared/services/utility.service';
import { NoResultsComponent } from '../no-results/no-results.component';
import { ResultsPaginationComponent } from '../results-pagination/results-pagination.component';
import { RouterLink } from '@angular/router';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-persons',
    templateUrl: '../persons/persons.component.html',
    styleUrls: ['./persons.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        MatProgressSpinner,
        TableComponent,
        NgFor,
        RouterLink,
        ResultsPaginationComponent,
        NoResultsComponent,
        HighlightSearchPipe,
    ],
})
export class PersonsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() resultData: Search;
  expandStatus: Array<boolean> = [];

  inputSub: Subscription;
  input: string;
  focusSub: any;
  tableColumns: TableColumn[];
  tableRows: Record<string, TableRow>[];
  iconTitle= '';
  dataMapped: boolean;

  @ViewChild('main') mainContent: ElementRef;

  svgIconIdString = 'main.categories.people.single';

  @ViewChildren('personNameColumn', { read: TemplateRef })
  personNameColumns: QueryList<ElementRef>;

  constructor(
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    private highlightPipe: HighlightSearchPipe,
    private tabChangeService: TabChangeService,
    public sortService: SortService,
    public utilityService: UtilityService
  ) {}

  ngOnInit(): void {}

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
    // Get cell data from template
    const nameColumnArray = this.personNameColumns.toArray();

    // Map data to table
    // Use highlight pipe for higlighting search term
    this.tableColumns = [
      {
        key: 'name',
        label: $localize`:@@name:Nimi`,
        class: 'col-3',
        mobile: true,
      },
      {
        key: 'organization',
        label: $localize`:@@organization:Organisaatio`,
        class: 'col-3',
        mobile: true,
      },
      {
        key: 'positionName',
        label: 'Nimike',
        class: 'col-3',
        mobile: true,
      },
      {
        key: 'keywords',
        label: $localize`:@@keywords:Avainsanat`,
        class: 'col-2',
        mobile: true,
      },
    ];

    const getUnique = (items: string[]) => [...new Set(items)];

    this.tableRows = this.resultData.persons.map((person, index) => ({
      name: {
        template: nameColumnArray[index],
        link: `/results/person/${person.id}`,
      },
      organization: {
        label: this.highlightPipe.transform(
          getUnique(this.mapAffiliations(person)
          ).join(', '),
          this.input
        ),
      },
      positionName: {
        label: this.highlightPipe.transform(
          getUnique(
            person.affiliations.organizations
              .flatMap((organanization) => organanization.items)
              .filter((item) => item.positionName.trim().length > 0)
              .map((item) => item.positionName)
          ).join(', '),
          this.input
        ),
      },
      keywords: {
        label: this.highlightPipe.transform(person.keywords, this.input),
      },
    }));

    this.dataMapped = true;
  }

  mapAffiliations(person): string[] {
    // If no primary affiliations set, show all affiliations
    if (person.affiliations.primary.length > 0) {
      return person.affiliations.primary.map((item) => item.organizationName);
    } else {
      return person.affiliations.organizations.map((item) => item.name);
    }
  }

  ngOnDestroy() {
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.tabChangeService.targetFocus('');
  }
}
