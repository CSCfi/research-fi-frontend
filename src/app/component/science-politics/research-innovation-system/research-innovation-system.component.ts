// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit } from '@angular/core';
import { faLandmark, faEuroSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-research-innovation-system',
  templateUrl: './research-innovation-system.component.html',
  styleUrls: ['./research-innovation-system.component.scss']
})
export class ResearchInnovationSystemComponent implements OnInit {
  faLandmark = faLandmark;
  faEuroSign = faEuroSign;

  sectorList = [
    {labelFi: 'Yliopistot', icon: faLandmark},
    {labelFi: 'Ammattikorkeakoulut', icon: faLandmark},
    {labelFi: 'Valtion tutkimuslaitokset', icon: faLandmark},
    {labelFi: 'Yliopistosairaalat', icon: faLandmark},
    {labelFi: 'Muut tutkimuslaitokset', icon: faLandmark},
    {labelFi: 'Tutkimuksen rahoittajat', icon: faEuroSign},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
