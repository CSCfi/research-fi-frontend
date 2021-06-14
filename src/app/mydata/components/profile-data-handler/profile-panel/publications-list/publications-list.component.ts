//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.scss'],
})
export class PublicationsListComponent {
  @Input() data: any[];
  @Output() onPublicationToggle = new EventEmitter<any>();

  showMoreArray = [];
  publicationArray = [];

  constructor() {}

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

    let arr = this.publicationArray;

    event.checked
      ? arr.find((item) => item.id === selectedPublication.id)
        ? null // Prevent adding of duplicate items
        : arr.push({ ...selectedPublication, show: true })
      : (arr = arr.filter((item) => item.id !== selectedPublication.id));

    this.onPublicationToggle.emit(arr);
  }
}
