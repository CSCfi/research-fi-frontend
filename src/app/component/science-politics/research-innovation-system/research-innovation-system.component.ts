// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ComponentFactoryResolver, ViewChild, ElementRef } from '@angular/core';
import { faLandmark, faEuroSign, faTimes, faHospital, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-research-innovation-system',
  templateUrl: './research-innovation-system.component.html',
  styleUrls: ['./research-innovation-system.component.scss']
})
export class ResearchInnovationSystemComponent implements OnInit {
  faLandmark = faLandmark;
  faEuroSign = faEuroSign;
  faHospital = faHospital;
  faBuilding = faBuilding;
  faTimes = faTimes;

  sectorList = [
    {id: 0, labelFi: 'Yliopistot', icon: faLandmark},
    {id: 1, labelFi: 'Ammattikorkeakoulut', icon: faLandmark},
    {id: 2, labelFi: 'Yliopistosairaalat', icon: faHospital},
    {id: 3, labelFi: 'Muut tutkimuslaitokset', icon: faBuilding},
    {id: 4, labelFi: 'Valtion tutkimuslaitokset', icon: faBuilding},
    {id: 5, labelFi: 'Tutkimuksen rahoittajat', icon: faEuroSign},
  ];

  selectedSector: any;
  rearrangedList: any;
  @ViewChild('openSector') openSector: ElementRef;

  constructor( private titleService: Title ) {
    this.selectedSector = null;
    this.rearrangedList = this.sectorList;
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  changeOrder(i) {
    this.rearrangedList = [];
    let data = [...this.sectorList];
    data.splice(i, 1);
    data.unshift(this.sectorList[i]);
    this.rearrangedList = data;
  }

  toggleOpen(i) {

  }

  ngOnInit(): void {
    this.setTitle('Tutkimus- ja innovaatiojärjestelmä - Tutkimustietovaranto');
  }

}
