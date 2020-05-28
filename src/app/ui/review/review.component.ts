//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReviewComponent implements OnInit {
  underReview = false;
  reviewTarget: string;
  reviewContent: string;
  locationTarget: string;
  locationValue: string;
  contactChecked = false;
  emailValue: string;
  reviewTargetError = false;
  reviewContentError = false;
  emailError = false;
  reviewChecked = false;
  reviewCheckedError = false;
  mathInput: number;
  mathError = false;
  math1: number;
  math2: number;
  equals: number;
  success = false;
  faTimes = faTimes;

  // TODO: Translate
  targets: string[] = ['Saavutettavuudesta', 'Tietosuojasta', 'Virheellisestä tiedosta', 'Muu palaute'];
  location: string;
  title: string;

  constructor(private dialogRef: MatDialogRef<ReviewComponent>, private router: Router, private titleService: Title ) { }

  ngOnInit(): void {
    // Get title
    this.title = this.titleService.getTitle();
    // Easy robot check
    this.math1 = this.getRandomInt(10);
    this.math2 = this.getRandomInt(10);
    this.equals = this.math1 + this.math2;
  }

  close() {
    this.dialogRef.close();
  }

  send() {
    // If form is passed and user has reviewed
    this.reviewCheckedError = this.reviewChecked ? false : true;
    this.mathError = this.mathInput !== this.equals ? true : false;

    if (this.underReview && this.reviewChecked && !this.mathError) {
      // this.underReview = false;
      this.success = true;
    }
  }

  getRoute() {
    return this.router.url;
  }

  toggleEmail(event) {
    // Remove email warning if visitor unchecks email
    if (this.emailError && !event.checked) {
      this.emailError = false;
    }
  }

  validate() {
    this.location = this.locationTarget === 'other' ? this.locationValue : this.getRoute();
    this.reviewTargetError = !this.reviewTarget ? true : false;
    this.reviewContentError = !this.reviewContent ? true : false;
    this.emailError = this.contactChecked && !this.validateEmail(this.emailValue) ? true : false;
    if (!this.reviewTargetError && !this.reviewContentError && !this.emailError) {
      this.underReview = true;
    }
  }

  validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

}
