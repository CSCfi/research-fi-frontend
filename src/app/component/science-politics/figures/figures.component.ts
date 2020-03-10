// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { faInfoCircle, faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { DOCUMENT } from '@angular/common';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-figures',
  templateUrl: './figures.component.html',
  styleUrls: ['./figures.component.scss']
})
export class FiguresComponent implements OnInit, AfterViewInit, OnDestroy {
  faIconCircle = faInfoCircle;
  faSearch = faSearch;
  faChartBar = faChartBar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  navItems = [
    {id: 's1', labelFi: 'Tiede ja tutkimus lukuina', icon: this.faIconCircle, active: true},
    {id: 's2', labelFi: 'Tutkimuksen henkilöstövoimavarat ja rahoitus', icon: this.faChartBar, active: false},
    {id: 's3', labelFi: 'Julkaisutoiminta ja tieteellinen vaikuttavuus', icon: this.faChartBar, active: false},
    {id: 's4', labelFi: 'Tutkimus- ja kehittämistoiminnan intensiteetti', icon: this.faChartBar, active: false},
  ];

  coLink = [
    {labelFi: 'Suomen Akatemia'},
    {labelFi: 'Tilastokeskus'},
    {labelFi: 'Vipunen'},
  ];

  allContent: any;

  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  link = 'test';
  currentSection: any;
  queryField: FormControl = new FormControl();
  queryResults: any[];
  combinedData: any;
  hasResults: boolean;
  queryTerm: any;
  @ViewChild('mainContent') mainContent: ElementRef;
  dataSub: any;
  mobile: boolean;
  showMenu: boolean;

  constructor( @Inject(DOCUMENT) private document: any, private cdr: ChangeDetectorRef, private searchService: SearchService ) {
    // Default to first segment
    this.currentSection = 's1';
    this.queryResults = [];
    this.queryTerm = '';
    this.hasResults = true;
   }

  ngOnInit(): void {
    // Get data from assets
    this.dataSub = this.searchService.getFigures().pipe(map(data => data)).subscribe(data => {
      const key = 'content';
      this.allContent = data[key];
      const combined = [];
      // Combine all items
      this.allContent.forEach(segment => combined.push(segment.items));
      this.combinedData = [].concat.apply([], combined);
      // Subscribe to input changes
      this.queryField.valueChanges.pipe(
        distinctUntilChanged()
        )
        .subscribe(term => {
          this.queryTerm = term;
          this.queryResults = term.length > 0 ? this.combinedData.filter(item => item.labelFi.includes(term)) : [];
          // Set results flag, used to show right template
          this.hasResults = this.queryResults.length === 0 && term.length > 0 ? false : true;
          // Highlight side nav item
          this.currentSection = this.queryResults.length > 0 ? '' : 's1';
      });
    });

  }

  ngAfterViewInit() {
    // Counte content width and set mobile true / false
    this.mobile = this.mainContent.nativeElement.offsetWidth > 991 ? false : true;
    // Show side menu on desktop
    this.showMenu = this.mobile ? false : true;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.dataSub.unsubscribe();
  }

  onSectionChange(sectionId: any) {
    this.currentSection = sectionId ? sectionId : 's1';
  }

  scrollTo(section) {
    this.document.querySelector('#' + section).scrollIntoView();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = this.mainContent.nativeElement.offsetWidth > 991 ? false : true;
    this.showMenu = this.mobile ? false : true;
  }
}
