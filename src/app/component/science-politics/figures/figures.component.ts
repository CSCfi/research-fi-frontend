// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, Inject } from '@angular/core';
import { faInfoCircle, faSearch} from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { DOCUMENT } from '@angular/common';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-figures',
  templateUrl: './figures.component.html',
  styleUrls: ['./figures.component.scss']
})
export class FiguresComponent implements OnInit {
  faIconCircle = faInfoCircle;
  faSearch = faSearch;
  faChartBar = faChartBar;

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

  allContent = [
    {id: 's2', headerFi: 'Tutkimuksen henkilöstövoimavarat ja rahoitus', items: [
      {labelFi: 'Yliopistojen opetus ja tutkimushenkilöstön henkilötyövuodet uraportaittain', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Yliopistojen kokonaisrahoitus, valtionrahoitus ja tutkimuksen rahoituslähteet', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Ulkomaalaisen opetus- ja tutkimus-henkilöstön henkilötyövuodet sekä osuus kaikista henkilötyövuosista yliopistoittain ja uraportaittain', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Tutkimustyövuosien indeksoitu kehitys yliopistoissa ja valtion tutkimuslaitoksissa', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
    ]},
    {id: 's3', headerFi: 'Julkaisutoiminta ja tieteellinen vaikuttavuus', items: [
      {labelFi: 'OECD-maiden ja Kiinan tieteellisen vaikuttavuuden kehitys Top 10 -indeksillä tarkasteltuna', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Suomen julkaisumäärän suhteellinen muutos', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Suomen julkaisujen tieteellinen vaikuttavuus julkaisuyhteistyön mukaan', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Suomen yhteistyömaat', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Yliopiston osuus tieteenalaryhmän julkaisuista yliopistoissa', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
    ]},
    {id: 's4', headerFi: 'Tutkimus- ja kehittämistoiminnan intensiteetti', items: [
      {labelFi: 'Tohtoreiden tutkimustyövuodet sektoreittain', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Suomen t&k menot ja t&k intensiteetti suorittajasektoreittain', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
      {labelFi: 'Suomen t&k intensiteetti kansainvälisessä vertailussa', descriptionFi: 'Kuvaus', img: 'assets/figure.jpg'},
    ]}
  ];

  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  link = 'test';
  currentSection: any;
  queryField: FormControl = new FormControl();
  queryResults: any[];
  combinedData: any;
  hasResults: boolean;
  queryTerm: any;

  constructor( @Inject(DOCUMENT) private document: any ) {
    // Default to first segment
    this.currentSection = 's1';
    this.queryResults = [];
    this.queryTerm = '';
    this.hasResults = true;
   }

  ngOnInit(): void {
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
  }

  onSectionChange(sectionId: any) {
    this.currentSection = sectionId;
  }

  scrollTo(section) {
    this.document.querySelector('#' + section).scrollIntoView();
  }
}
