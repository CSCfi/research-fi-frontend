//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WINDOW } from 'src/app/services/window.service';
import { DOCUMENT } from '@angular/common';
import { ResizeService } from 'src/app/services/resize.service';

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
  result = false;
  sending = false;
  error = false;
  success = false;
  faTimes = faTimes;
  resizeSub: Subscription;
  vh = this.window.innerHeight * 0.01;

  // TODO: Translate
  targets: string[] = [
    $localize`:@@fromAccessibility:Saavutettavuudesta`,
    $localize`:@@fromPrivacy:Tietosuojasta`,
    $localize`:@@fromIncorrectInformation:Virheellisestä tiedosta`,
    $localize`:@@otherFeedback:Muu palaute`];
  location: string;
  title: string;

  constructor(private dialogRef: MatDialogRef<ReviewComponent>, private router: Router, private titleService: Title,
              private httpClient: HttpClient, @Inject(WINDOW) private window: Window, @Inject(DOCUMENT) private document: Document,
              private resizeService: ResizeService) { }

  ngOnInit(): void {
    // Get title
    this.title = this.titleService.getTitle();
    // Easy robot check
    this.math1 = this.getRandomInt(10);
    this.math2 = this.getRandomInt(10);
    this.equals = this.math1 + this.math2;
    this.resizeSub = this.resizeService.onResize$.subscribe(event => this.onResize(event));
    // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    this.document.documentElement.style.setProperty('--vh', `${this.vh}px`);
  }

  close() {
    this.dialogRef.close();
  }

  getBodyJson(): Object {
    return {
      'reviewTarget': this.reviewTarget,
      'reviewContent': this.reviewContent,
      'location': (this.locationValue ? this.locationValue : (this.title + '\n' + this.getRoute())),
      'contactChecked':this.contactChecked,
      'emailValue': this.emailValue
    };
  }

  sendPost(data: Object): Observable<Object> {
    return this.httpClient.post('/feedback', data);
  }

  send() {
    // If form is passed and user has reviewed
    this.reviewCheckedError = this.reviewChecked ? false : true;
    this.mathError = this.mathInput !== this.equals ? true : false;

    if (this.underReview && this.reviewChecked && !this.mathError) {
      // Send form data
      this.sending = true;
      this.sendPost(this.getBodyJson()).subscribe(
        success => {
          this.sending = false;
          this.result = true;
          this.error = false;
        },
        err => {
          this.sending = false;
          this.result = true;
          this.error = true;
        }
      );
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

  onResize(event: {width: number, height: number}) {
    this.document.documentElement.style.setProperty('--vh', `${event.height * 0.01}`)
  }

}
