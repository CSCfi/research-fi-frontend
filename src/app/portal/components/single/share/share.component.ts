//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, LOCALE_ID, Input, OnChanges } from '@angular/core';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit, OnChanges {
  @Input() big = true;
  @Input() id: string;

  faCopy = faCopy;
  currentUrl: string;
  message: string;

  copyLink = $localize`:@@copyLink:Kopioi linkki`;

  constructor(
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) protected localeId: string
  ) {}

  ngOnInit() {
    switch (this.localeId) {
      case 'en': {
        this.message = 'Link copied to clipboard';
        break;
      }
      case 'sv': {
        this.message = 'Länk kopierad till urklipp';
        break;
      }
      default: {
        this.message = 'Linkki kopioitu leikepöydälle';
      }
    }
  }

  ngOnChanges() {
    this.currentUrl = this.document.location.href;
  }

  openSnackBar() {
    this.snackBar.open(this.message);
  }
}
