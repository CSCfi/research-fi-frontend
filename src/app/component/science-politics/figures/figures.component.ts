// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit } from '@angular/core';
import { faInfoCircle, faSearch} from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';

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
    {labelFi: 'Tiede ja tutkimus lukuina', icon: this.faIconCircle, active: true},
    {labelFi: 'Tutkimuksen henkilöstövoimavarat ja rahoitus', icon: this.faChartBar, active: false},
    {labelFi: 'Julkaisutoiminta ja tieteellinen vaikuttavuus', icon: this.faChartBar, active: false},
    {labelFi: 'Tutkimus- ja kehittämistoiminnan intensiteetti', icon: this.faChartBar, active: false},
  ];

  coLink = [
    {labelFi: 'Suomen Akatemia'},
    {labelFi: 'Tilastokeskus'},
    {labelFi: 'Vipunen'},
  ];

  content1 = [
    {labelFi: 'Yliopistojen opetus ja tutkimushenkilöstön henkilötyövuodet uraportaittain', descriptionFi: 'Kuvaus', img: ''},
    {labelFi: 'Yliopistojen kokonaisrahoitus, valtionrahoitus ja tutkimuksen rahoituslähteet', descriptionFi: 'Kuvaus', img: ''},
    {labelFi: 'Ulkomaalaisen opetus- ja tutkimus-henkilöstön henkilötyövuodet sekä osuus kaikista henkilötyövuosista yliopistoittain ja uraportaittain', descriptionFi: 'Kuvaus', img: ''},
    {labelFi: 'Tutkimustyövuosien indeksoitu kehitys yliopistoissa ja valtion tutkimuslaitoksissa', descriptionFi: 'Kuvaus', img: ''},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
