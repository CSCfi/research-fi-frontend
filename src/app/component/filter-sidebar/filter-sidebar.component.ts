//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material';

@Component({
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss']
})
export class FilterSidebarComponent implements OnInit {
  @Input() responseData: any [];
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  mobile = window.innerWidth < 991;
  width = window.innerWidth;
  @ViewChild('selectedYears') selectedYears: MatSelectionList;

  constructor() { }

  toggleNavbar() {
    this.sidebarOpen = !this.sidebarOpen;
    const elem = document.getElementById('filter-sidebar');

    if (this.sidebarOpen) {
      elem.style.display = 'block';
    } else {
      elem.style.display = 'none';
    }
  }

  onResize(event) {
    const elem = document.getElementById('filter-sidebar');
    this.width = window.innerWidth;
    if (this.width >= 991) {
      elem.style.display = 'block';
    } else {
      elem.style.display = 'none';
    }
  }

  onSelectionChange() {
    console.log(this.getSelected());
  }

  getSelected() {
    return this.selectedYears.selectedOptions.selected.map(s => s.value);
  }

  ngOnInit() {

  }

}
