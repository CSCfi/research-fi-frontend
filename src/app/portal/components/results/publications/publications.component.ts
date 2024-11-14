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
  Inject,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  TemplateRef,
  QueryList,
} from '@angular/core';
import { DOCUMENT, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { SearchService } from 'src/app/portal/services/search.service';
import { Search } from 'src/app/portal/models/search.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { TableColumn, TableRow } from 'src/types';
import { LinksPipe } from '../../../pipes/links.pipe';
import { NoResultsComponent } from '../no-results/no-results.component';
import { ResultsPaginationComponent } from '../results-pagination/results-pagination.component';
import { TagDoiComponent } from '../../../../shared/components/tags/tag-doi/tag-doi.component';
import { TagOpenAccessComponent } from '../../../../shared/components/tags/tag-open-access/tag-open-access.component';
import { TagPeerReviewedComponent } from '../../../../shared/components/tags/tag-peer-reviewed/tag-peer-reviewed.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CutContentPipe } from '@shared/pipes/cut-content.pipe';
import { HighlightSearchPipe } from '@portal/pipes/highlight.pipe';

@Component({
    selector: 'app-publications',
    templateUrl: './publications.component.html',
    styleUrls: ['./publications.component.scss'],
    standalone: true,
  imports: [
    NgIf,
    MatProgressSpinner,
    TableComponent,
    NgFor,
    RouterLink,
    TagPeerReviewedComponent,
    TagOpenAccessComponent,
    TagDoiComponent,
    ResultsPaginationComponent,
    NoResultsComponent,
    LinksPipe,
    CutContentPipe,
    HighlightSearchPipe
  ]
})
export class PublicationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() resultData: Search;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  @ViewChild('main') mainContent: ElementRef;

  faIcon: any = this.tabChangeService.tabData
    .filter((t) => t.data === 'publications')
    .map((t) => t.icon)
    .pop();
  documentLang: any;
  input: string;
  inputSub: any;
  focusSub: any;
  marginTop = 0;
  heightSub: any;

  tableColumns: TableColumn[];
  tableRows: Record<string, TableRow>[];

  @ViewChildren('publicationNameColumn', { read: TemplateRef })
  publicationNameColumns: QueryList<ElementRef>;

  @ViewChildren('publicationChannelColumn', { read: TemplateRef })
  publicationChannelColumns: QueryList<ElementRef>;

  dataMapped: boolean;
  iconTitlePublications = $localize`:@@iconPublications: Julkaisujen tiedon ikoni`;

  constructor(
    private route: ActivatedRoute,
    private sortService: SortService,
    @Inject(DOCUMENT) private document: any,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearchPipe,
    private cutContentPipe: CutContentPipe
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
    // Get cell data from template
    const nameColumnArray = this.publicationNameColumns.toArray();
    const channelColumnArray = this.publicationChannelColumns.toArray();

    // Map data to table
    // Use highlight pipe for higlighting search term
    this.tableColumns = [
      {
        key: 'name',
        label: $localize`:@@publicationName:Julkaisun nimi`,
        class: 'col-8 col-lg-5 col-xl-4',
        mobile: true,
      },
      {
        key: 'author',
        label: $localize`:@@publicationAuthors:Tekijät`,
        class: 'col-lg-5 col-xl-3 d-none d-lg-block',
        mobile: false,
      },
      {
        key: 'medium',
        label: $localize`:@@publicationMedium:Julkaisukanava`,
        tooltip: $localize`:@@publicationMediumTooltip:Lehti, kustantaja tai sarja, jossa julkaisu on ilmestynyt.`,
        class: 'col-xl-3 d-none d-xl-block',
        mobile: false,
      },
      {
        key: 'year',
        label: $localize`:@@year:Vuosi`,
        class: 'col-lg-1',
        mobile: true,
      },
    ];
    this.tableRows = this.resultData.publications.map((publication, index) => ({
      name: {
        template: nameColumnArray[index],
        link: `/results/publication/${publication.id}`, // For icon link
      },
      author: {
        label: this.highlightPipe.transform(this.cutContentPipe.transform(publication.authors, 100)  , this.input),
      },
      medium: {
        template: channelColumnArray[index],
      },
      year: {
        label: this.highlightPipe.transform(
          publication.publicationYear,
          this.input
        ),
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
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
  }
}
