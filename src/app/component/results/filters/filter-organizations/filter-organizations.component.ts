//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, OnChanges, Input, ViewChild, ChangeDetectorRef, Inject, TemplateRef } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Router } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { ResizeService } from '../../../../services/resize.service';
import { Subscription } from 'rxjs';
import { FilterService } from '../../../../services/filter.service';
import { DataService } from '../../../../services/data.service';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-filter-organizations',
  templateUrl: './filter-organizations.component.html',
  styleUrls: ['./filter-organizations.component.scss']
})
export class FilterOrganizationsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  width = this.window.innerWidth;
  mobile = this.width < 992;
  panelHeight = '48px';
  @ViewChild('selectedSectors', { static: false }) selectedSectors: MatSelectionList;
  preSelection: any;
  modalRef: BsModalRef;

  private resizeSub: Subscription;
  private filterSub: Subscription;
  sectorFilter: any[];

  constructor( private router: Router, private filterService: FilterService, @Inject(WINDOW) private window: Window,
               private resizeService: ResizeService, private sortService: SortService, private modalService: BsModalService,
               private dataService: DataService, private cdr: ChangeDetectorRef ) { }


  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
    // Set to undefined so it indicates whether modal is open or closed
    this.modalRef = undefined;
  }

  preventTab(event) {
    UtilityService.preventTab(event);
  }

  preventTabBack(event) {
    UtilityService.preventTabBack(event, this.modalRef !== undefined);
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
    { queryParams: {
        sort: this.sortService.sortMethod,
        sector: this.sectorFilter.length > 0 ? this.sectorFilter : null
      },
      queryParamsHandling: 'merge'
    });
  }

  getSelected() {
    this.sectorFilter = this.selectedSectors.selectedOptions.selected.map(s => s.value);
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

  ngOnChanges() {

  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
    this.filterSub.unsubscribe();
  }

}
