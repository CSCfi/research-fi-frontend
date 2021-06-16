//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { PublicationsService } from '@mydata/services/publications.service';

@Component({
  selector: 'app-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.scss'],
})
export class PublicationsListComponent implements OnInit, OnChanges {
  @Input() data: any[];
  @Input() total: number;
  @Input() selectedItems: any;
  @Output() onPublicationToggle = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onSortToggle = new EventEmitter<any>();

  showMoreArray = [];
  publicationArray = [];

  currentPage = 1;
  currentPageSize = 10;
  pageCount: number;

  displayedColumns: string[] = ['selection', 'year', 'name', 'edit'];

  sortSettings: any;
  selectedItemsIdArray: any[];

  constructor(private publicationService: PublicationsService) {
    this.sortSettings = this.publicationService.currentSort;
  }

  ngOnInit() {
    // Check match in template
    this.selectedItemsIdArray = this.selectedItems.map((item) => item.id);
  }

  ngOnChanges() {
    this.pageCount = Math.ceil(this.total / this.currentPageSize);
  }

  showMore(index) {
    this.showMoreArray.push(index);
  }

  showLess(index) {
    const arr = this.showMoreArray;
    const item = arr.indexOf(index);

    arr.splice(item, 1);
  }

  togglePublication(event, index) {
    const selectedPublication = this.data[index]._source;
    let selectedItems = this.selectedItems;

    let arr = this.publicationArray;

    if (selectedItems.find((item) => item.id === selectedPublication.id)) {
      arr.push({
        ...selectedItems.find((item) => item.id === selectedPublication.id),
        show: event.checked,
      });
    } else {
      event.checked
        ? arr.find((item) => item.id === selectedPublication.id)
          ? null // Prevent adding of duplicate items
          : arr.push({ ...selectedPublication, show: true })
        : (arr = arr.filter((item) => item.id !== selectedPublication.id));
    }

    this.onPublicationToggle.emit(arr);
  }

  sortData(sortSettings) {
    this.onSortToggle.emit(sortSettings);
  }

  navigate(event) {
    this.data = [];
    this.currentPage = event.pageIndex + 1;
    this.currentPageSize = event.pageSize;

    this.pageCount = Math.ceil(this.total / event.pageSize);

    this.onPageChange.emit(event);
  }
}
