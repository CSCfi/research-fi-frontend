//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, OnChanges, ViewChildren, QueryList,
         ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { Router } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { ResizeService } from '../../../../services/resize.service';
import { Subscription } from 'rxjs';
import { FilterService } from '../../../../services/filter.service';
import { FilterMethodService } from '../../../../services/filter-method.service';

@Component({
  selector: 'app-filter-publications',
  templateUrl: './filter-publications.component.html',
  styleUrls: ['./filter-publications.component.scss']
})
export class FilterPublicationsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  width = window.innerWidth;
  mobile = this.width < 992;
  @ViewChild('selectedYear') selectedYear: MatSelectionList;
  @ViewChildren('selectedFields') selectedFields: QueryList<MatSelectionList>;
  @ViewChildren('selectedPublicationTypes') selectedPublicationTypes: QueryList<MatSelectionList>;
  @ViewChild('selectedCountryCode') selectedCountryCode: MatSelectionList;
  @ViewChild('selectedLang') selectedLang: MatSelectionList;
  @ViewChild('selectedJuFo') selectedJuFo: MatSelectionList;
  @ViewChild('selectedOpenAccess') selectedOpenAccess: MatSelectionList;
  @ViewChild('filterSidebar') filterSidebar: ElementRef;
  preSelection = [];

  private resizeSub: Subscription;
  private filterSub: Subscription;
  yearFilter: any[];
  fieldOfScienceFilter: any;
  publicationTypeFilter: any;
  countryCodeFilter: any;
  langFilter: any;
  juFoFilter: any;
  openAccessFilter: any;
  fields: any;
  filterTerm: string;

  majorFieldsOfScience = [
    {fieldId: 1, field: 'Luonnontieteet', checked: false},
    {fieldId: 2, field: 'Tekniikka', checked: false},
    {fieldId: 3, field: 'Lääke- ja yritystieteet', checked: false},
    {fieldId: 4, field: 'Maatalous- ja metsätieteet', checked: false},
    {fieldId: 5, field: 'Yhteiskuntatieteet', checked: false},
    {fieldId: 6, field: 'Humanistiset tieteet', checked: false},
    {fieldId: 9, field: 'Muut tieteet', checked: false}
  ];

  publicationClass = [
    {id: 1, class: 'A', label: 'Vertaisarvioidut tieteelliset artikkelit', types: [
      {type: 'A1', label: 'Kirjoitus tieteellisessä aikakauslehdessä'},
      {type: 'A2', label: 'Kirjan tai muun kokoomateoksen osa'},
      {type: 'A3', label: 'Vertaisarvioimaton artikkeli konferenssijulkaisussa'},
      {type: 'A4', label: 'Artikkeli konferenssijulkaisussa'}
    ],
    checked: false
    },
    {id: 2, class: 'B', label: 'Vertaisarvioimattomat tieteelliset kirjoitukset', types: [
      {type: 'B1', label: 'Alkuperäisartikkeli tieteellisessä aikakauslehdessä'},
      {type: 'B2', label: 'Katsausartikkeli tieteellisessä aikakauslehdessä'},
      {type: 'B3', label: 'Kirjan tai muun kokoomateoksen osa'}
    ],
    checked: false
    },
    {id: 3, class: 'C', label: 'Tieteelliset kirjat (monografiat)', types: [
      {type: 'C1', label: 'Kustannettu tieteellinen erillisteos'},
      {type: 'C2', label: 'Toimitettu kirja, kokoomateos, konferenssijulkaisu tai lehden erikoisnumero'}
    ],
    checked: false
    },
    {id: 4, class: 'D', label: 'Ammattiyhteisölle suunnatut julkaisut', types: [
      {type: 'D1', label: 'Artikkeli ammattilehdessä'},
      {type: 'D2', label: 'Artikkeli ammatillisessa käsi- tai opaskirjassa, ammatillisessa tietojärjestelmässä tai oppikirja-aineisto'},
      {type: 'D3', label: 'Artikkeli ammatillisessa konferenssijulkaisussa'},
      {type: 'D4', label: 'Julkaistu kehittämis- tai tutkimusraportti taikka -selvitys'},
      {type: 'D5', label: 'Oppikirja, ammatillinen käsi- tai opaskirja taikka sanakirja'},
      {type: 'D6', label: 'Toimitettu ammatillinen teos'}
    ],
    checked: false
    },
    {id: 5, class: 'E', label: 'Suurelle yleisölle suunnatut julkaisut', types: [
      {type: 'E1', label: 'Yleistajuinen artikkeli, sanomalehtiartikkeli'},
      {type: 'E2', label: 'Yleistajuinen monografia'},
      {type: 'E3', label: 'Toimitettu yleistajuinen teos'}
    ],
    checked: false
    },
    {id: 6, class: 'F', label: 'Julkinen taiteellinen ja taideteollinen toiminta', types: [
      {type: 'F1', label: 'Erillisjulkaisu'},
      {type: 'F2', label: 'Julkinen taiteellinen teoksen osatoteutus'},
      {type: 'F3', label: 'Ei-taiteellisen julkaisun taiteellinen osa'}
    ],
    checked: false
    },
    {id: 7, class: 'G', label: 'Opinnäytteet', types: [
      {type: 'F1', label: 'Monografiaväitöskirja'},
      {type: 'F2', label: 'Artikkeliväitöskirja'}
    ]}
  ];

  mappedFieldsofScience: any;
  mappedPublicationClass: any;
  combinedMajorFields: any[];
  combinedPublicationClasses: any[];
  mergedFields: any;
  openAccessCodes: any[];
  filteredPublicationClass: any[];
  internationalCollab = false;
  panelHeight = '48px';
  public height: number;
  public clickCount: number;
  limitList = true;
  parentChecked: boolean;
  checked: Subscription;

  constructor( private router: Router, private filterService: FilterService, private resizeService: ResizeService,
               private sortService: SortService, private cdr: ChangeDetectorRef, private filterMethodService: FilterMethodService ) {
                 this.height = 240;
                 this.clickCount = 0;
                }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      this.filterSidebar.nativeElement.style.display = 'block';
    } else {
      this.filterSidebar.nativeElement.style.display = 'none';
    }
  }

  resetHeight() {
    this.height = 240;
    this.clickCount = 0;
  }

  showMore(total) {
    this.clickCount++;
    total = total - 5 * this.clickCount;
    if (total < 5) {
      this.height = this.height + total * 48;
    } else {this.height = this.height + 240; }
  }

  onResize(event) {
    this.width = window.innerWidth;
    if (this.width >= 992) {
      this.mobile = false;
      if (!this.sidebarOpen) { this.toggleSidebar(); }
    } else {
      this.mobile = true;
      if (this.sidebarOpen) { this.toggleSidebar(); }
    }
  }

  onSelectionChange() {
    this.getSelected();
    this.router.navigate([],
    { queryParams: { page: 1, sort: this.sortService.sortMethod, year: this.yearFilter, field: this.fieldOfScienceFilter,
      lang: this.langFilter, publicationType: this.publicationTypeFilter, countryCode: this.countryCodeFilter,
      juFo: this.juFoFilter, openAccess: this.openAccessFilter, internationalCollaboration: this.internationalCollab } });
  }

  // Select all from major
  selectAll(event, i, filter) {
    const major = this.selectedFields.toArray();
    const typeClass = this.selectedPublicationTypes.toArray();

    switch (event.checked) {
      case true: {
        switch (filter) {
          case 'field': {
            major[i].selectAll();
            break;
          }
          case 'type': {
            typeClass[i].selectAll();
            break;
          }
        }
        break;
      }
      case false: {
        switch (filter) {
          case 'field': {
            major[i].deselectAll();
            break;
          }
          case 'type': {
            typeClass[i].deselectAll();
            break;
          }
        }
        break;
      }
    }
    this.onSelectionChange();
  }

  // Single checkbox
  singleSelect(event) {
    if (event.checked) {this.internationalCollab = true; } else {this.internationalCollab = null; }
    this.onSelectionChange();
  }

  getSelected() {
    // If international collaboration is false, prevent param initalization
    if (!this.internationalCollab) {this.internationalCollab = null; }
    this.yearFilter = this.selectedYear.selectedOptions.selected.map(s => s.value);
    this.fieldOfScienceFilter = this.filterMethodService.mergeChildren(this.selectedFields);
    this.publicationTypeFilter = this.filterMethodService.mergeChildren(this.selectedPublicationTypes);
    this.countryCodeFilter = this.selectedCountryCode.selectedOptions.selected.map(s => s.value);
    this.langFilter = this.selectedLang.selectedOptions.selected.map(s => s.value);
    this.juFoFilter = this.selectedJuFo.selectedOptions.selected.map(s => s.value);
    this.openAccessFilter = this.selectedOpenAccess.selectedOptions.selected.map(s => s.value);
  }

  ngOnInit() {
    // Subscribe to filter service filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      if (filters.internationalCollaboration.length > 0) {this.internationalCollab = true; } else {this.internationalCollab = false; }
      Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));

      // Listen for changes in querylist
      if (this.selectedFields) {
        this.selectedFields.notifyOnChanges();
        this.selectedPublicationTypes.notifyOnChanges();
      }
    });

    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngAfterViewInit() {
    this.isChecked();
  }

  // Wait for responseData and shape filter by term
  ngOnChanges() {
    this.responseData = this.responseData || [];
    this.filterTerm = this.filterTerm || '';
    const source = this.responseData[0] ? this.responseData[0].aggregations.fieldsOfScience.buckets : [];
    this.fields = this.subFilter(source, this.filterTerm);
    this.combinedMajorFields = this.filterMethodService.separateMinor(
      this.responseData[0] ? this.responseData[0].aggregations.fieldsOfScience.buckets : []);
    this.separatePublicationClass();
    this.openAccess();
    this.cdr.detectChanges();
  }

  // Find fields where all items are checked and change checked status of majors in majorFieldsOfScience array of objects
  isChecked() {
    let objIndex: number;
    if (this.selectedFields) {
      // Subscribe to selection lists
      this.selectedFields.changes.subscribe(() => {
        const array = this.selectedFields.toArray();
        for (let i = 0; i <= array.length - 1; i++) {
          // Compare sums of list and selection, change value of checked major, won't work without timeout
          setTimeout(() => {
            if (array[i].options.length > 0 && array[i].options.length === array[i].selectedOptions.selected.length) {
              objIndex = this.majorFieldsOfScience.findIndex((obj => obj.fieldId === i + 1));
              this.majorFieldsOfScience[objIndex].checked = true;
            } else {
              this.majorFieldsOfScience[i].checked = false;
            }
          }, 0);
        }
      });
    }

    if (this.selectedPublicationTypes) {
      // Subscribe to selection lists
      this.selectedPublicationTypes.changes.subscribe(() => {
        const array = this.selectedPublicationTypes.toArray();
        for (let i = 0; i <= array.length - 1; i++) {
          // Compare sums of list and selection, change value of checked major, won't work without timeout
          setTimeout(() => {
            if (array[i].options.length > 0 && array[i].options.length === array[i].selectedOptions.selected.length) {
              objIndex = this.publicationClass.findIndex((obj => obj.id === i + 1));
              this.publicationClass[objIndex].checked = true;
            } else {
              this.publicationClass[i].checked = false;
            }
          }, 0);
        }
      });
    }
  }

  // Arrange publication type classes as parent classes (A, B, C...)
  separatePublicationClass() {
    const source = this.responseData[0] ? this.responseData[0].aggregations.publicationType.buckets : [];
    const combined = [];
    this.combinedPublicationClasses = [];
    if (source && source.length > 0) {
      source.forEach(val => combined.push(val.key.substring(0, 1)));
      this.openAccessCodes = [];
      this.filteredPublicationClass = combined.filter((v, i, a) => a.indexOf(v) === i);
    }
  }

  // Open access
  openAccess() {
    const combined = [];
    // Get aggregation from response
    const source = this.responseData[0] ? this.responseData[0].aggregations.openAccess.buckets : [];
    if (source && source.length > 0) {
      source.forEach(val => combined.push(val.key));
      this.openAccessCodes = [];
      // Check for matching access codes. -1 & 9 are fallbacks from old data
      if (combined.includes(-1) || combined.includes(0) || combined.includes(9)) {this.openAccessCodes.push(
        {key: 0, label: 'Ei vastausta', value: 'noAccessInfo'}); }
      if (combined.includes(1)) {this.openAccessCodes.push({key: 1, label: 'Open access', value: 'openAccess'}); }
      if (combined.includes(2)) {this.openAccessCodes.push({key: 2, label: 'Hybridijulkaisu', value: 'hybridAccess'}); }
    }
  }

  // Get value from input inside filter
  filterInput(event) {
    this.filterTerm = event.target.value;
    this.ngOnChanges();
  }

  // Search for term where values are in string format
  subFilter(array: any, term: string) {
    return array.filter(obj => obj.key.toLowerCase().includes(term.toLowerCase()));
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.resizeSub.unsubscribe();
  }

}
