//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Inject, TemplateRef } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Router } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { FilterService } from '../../../../services/filter.service';
import { ResizeService } from '../../../../services/resize.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-filter-fundings',
  templateUrl: './filter-fundings.component.html',
  styleUrls: ['./filter-fundings.component.scss']
})
export class FilterFundingsComponent implements OnInit, OnDestroy {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  width = this.window.innerWidth;
  mobile = this.width < 992;
  panelHeight = '48px';
  @ViewChild('selectedYears', { static: false }) selectedYears: MatSelectionList;
  @ViewChild('selectedFundingAmount', { static: false }) selectedFundingAmount: MatSelectionList;
  @ViewChild('selectedStatus', { static: false }) selectedStatus: MatSelectionList;
  preSelection: any;

  private resizeSub: Subscription;
  private filterSub: Subscription;
  yearFilters: any[];
  fundingAmountFilter: any[];
  statusFilter: any[];
  combinedFilters: any;

  modalRef: BsModalRef;

  constructor( private router: Router, private filterService: FilterService, @Inject(WINDOW) private window: Window,
               private resizeService: ResizeService, private sortService: SortService, private modalService: BsModalService ) { }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  onResize(event) {
    this.width = event.width;
    if (this.width >= 992) {
      this.mobile = false;
      // Modal existence check
      // tslint:disable-next-line: no-unused-expression
      this.modalRef && this.closeModal();
    } else {
      this.mobile = true;
    }
  }

  onSelectionChange() {
    this.getSelected();
    this.router.navigate([],
    { queryParams: { sort: this.sortService.sortMethod, year: this.yearFilters, fundingAmount: this.fundingAmountFilter,
      status: this.statusFilter } });
  }

  getSelected() {
    this.statusFilter = this.selectedStatus.selectedOptions.selected.map(s => s.value);
    this.yearFilters = this.selectedYears.selectedOptions.selected.map(s => s.value);
    this.fundingAmountFilter = this.selectedFundingAmount.selectedOptions.selected.map(s => s.value);
    this.combinedFilters = this.statusFilter.concat(this.yearFilters);
    return this.combinedFilters;
  }

  ngOnInit() {
    // Subscribe to filter service filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
    this.filterSub.unsubscribe();
  }

}

