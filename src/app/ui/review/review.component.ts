//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { faSmile } from '@fortawesome/free-solid-svg-icons';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReviewComponent implements OnInit {
  faSmile = faSmile;
  underReview = false;
  reviewTarget: string;
  reviewContent: string;
  locationTarget: string;
  locationValue: string;
  contactChecked = false;
  emailValue: string;
  reviewContentError = false;
  reviewTargetError = false;
  reviewChecked = false;

  targets: string[] = ['Saavutettavuudesta', 'Tietosuojasta', 'Virheellisestä tiedosta', 'Muu palaute'];

  constructor(private dialogRef: MatDialogRef<ReviewComponent>) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  send() {
    console.log(this.locationTarget);
    if (!this.reviewTarget) {
      this.reviewTargetError = true;
    } else if (!this.reviewContent) {
      this.reviewContentError = true;
    } else {
      this.underReview = true;
    }

    if (this.underReview && this.reviewChecked) {
      console.log('jahuu');
    }
  }

}
