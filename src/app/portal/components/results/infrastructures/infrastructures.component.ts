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
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  TemplateRef,
  ViewContainerRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { SearchService } from 'src/app/portal/services/search.service';
import { SortService } from 'src/app/portal/services/sort.service';
import { Search } from 'src/app/portal/models/search.model';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { TableColumn, TableRowItem } from 'src/types';
import { HighlightSearch } from '@portal/pipes/highlight.pipe';

@Component({
  selector: 'app-infrastructures',
  templateUrl: './infrastructures.component.html',
  styleUrls: ['./infrastructures.component.scss'],
})
export class InfrastructuresComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() resultData: Search;
  @ViewChild('main') mainContent: ElementRef;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  faIcon = this.tabChangeService.tabData
    .filter((t) => t.data === 'infrastructures')
    .map((t) => t.icon)
    .pop();
  inputSub: any;
  input: string;
  focusSub: any;
  faCheckCircle = faCheckCircle;

  tableColumns: TableColumn[];
  tableRows: Record<string, TableRowItem>[];

  @ViewChild('infrastructureNameColumn', { read: TemplateRef })
  infrastructureNameColumn: TemplateRef<any>;

  @ViewChildren('infrastructureNameColumns', { read: TemplateRef })
  infrastructureNameColumns: QueryList<ElementRef>;

  @ViewChild('container', { read: ViewContainerRef }) container: any;

  dataMapped: boolean;

  constructor(
    private route: ActivatedRoute,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private sortService: SortService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService,
    private highlightPipe: HighlightSearch,
    private vref: ViewContainerRef
  ) {}

  ngOnInit() {
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
  }

  mapData() {
    // Get cell data from template
    console.log(this.infrastructureNameColumns);

    // Map data to table
    // Use highlight pipe for higlighting search term
    this.tableColumns = [
      {
        key: 'acronym',
        label: $localize`:@@infraAcronym:Lyhenne`,
        tooltip: $localize`:@@acronymTooltip:Tutkimusinfrastruktuurin lyhenne. Infrastruktuureille on tyypillistä, että ne tunnetaan lyhenteellään.`,
        columnSize: 2,
      },
      { key: 'name', label: $localize`:@@infraName:Nimi`, columnSize: 4 },
      {
        key: 'organization',
        label: $localize`:@@infraOrganization:Organisaatio`,

        tooltip: $localize`:@@infraOrganizationTooltip:Tutkimusinfrastruktuurin vastuuorganisaatio. Etenkin suurilla infrastruktuureilla voi olla useita palveluita, joista vastaa joku muu organisaatio. Muut organisaatiot näkee infrastruktuurin tietosivulta.`,
        columnSize: 4,
      },
    ];
    this.tableRows = this.resultData.infrastructures.map(
      (infrastructure, index) => ({
        acronym: {
          label: this.highlightPipe.transform(
            infrastructure.acronym,
            this.input
          ),
        },
        name: {
          label: this.highlightPipe.transform(infrastructure.name, this.input),
          template: this.infrastructureNameColumns[index],
          link: `/results/infrastructure/${infrastructure.id}`,
        },
        organization: {
          label: this.highlightPipe.transform(
            infrastructure.responsibleOrganization,
            this.input
          ),
        },
      })
    );

    this.dataMapped = true;
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
      console.log(this.tableRows);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.tabChangeService.targetFocus('');
  }
}
