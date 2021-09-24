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
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { PublicationsService } from '@mydata/services/publications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PublicationsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any[];
  @Input() total: number;
  @Input() profilePublications: any;
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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  termSub: Subscription;

  constructor(private publicationService: PublicationsService) {
    this.sortSettings = this.publicationService.currentSort;
  }

  ngOnInit() {
    // Reset to first page on term change
    this.termSub = this.publicationService.currentTerm.subscribe(() => {
      this.currentPage = 1;
      if (this.paginator) this.paginator.pageIndex = 0;
    });

    // Check match in template
    const profileItems = this.profilePublications
      .flatMap((item) => item.items)
      .map((item) => item.publicationId)
      .filter((item) => item.trim().length);

    const preSelection = this.selectedItems;

    this.selectedItemsIdArray = preSelection
      .map((item) => item.publicationId)
      .concat(profileItems);
  }

  ngOnChanges() {
    this.pageCount = Math.ceil(this.total / this.currentPageSize);
  }

  ngOnDestroy() {
    this.termSub?.unsubscribe();
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

    if (
      selectedItems.find(
        (item) => item.publicationId === selectedPublication.publicationId
      )
    ) {
      arr.push({
        ...selectedItems.find(
          (item) => item.publicationId === selectedPublication.publicationId
        ),
        show: event.checked,
      });
    } else {
      event.checked
        ? arr.find(
            (item) => item.publicationId === selectedPublication.publicationId
          )
          ? null // Prevent adding of duplicate items
          : arr.push({ ...selectedPublication, show: true })
        : (arr = arr.filter(
            (item) => item.publicationId !== selectedPublication.publicationId
          ));
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
