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
import { ResizeService } from '../../../../services/resize.service';
import { Subscription } from 'rxjs';
import { FilterService } from '../../../../services/filter.service';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-filter-persons',
  templateUrl: './filter-persons.component.html',
  styleUrls: ['./filter-persons.component.scss']
})
export class FilterPersonsComponent implements OnInit, OnDestroy {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  width = this.window.innerWidth;
  mobile = this.width < 992;
  panelHeight = '48px';
  @ViewChild('selectedYears', { static: false }) selectedYears: MatSelectionList;
  @ViewChild('filterSidebar', { static: false }) filterSidebar: ElementRef;
  preSelection: any;

  modalRef: BsModalRef;

  private resizeSub: Subscription;
  private filterSub: Subscription;

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
    this.router.navigate([],
    { queryParams: { sort: this.sortService.sortMethod, year: this.getSelected() } });
  }

  getSelected() {
    return this.selectedYears.selectedOptions.selected.map(s => s.value);
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
