//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-orcid-data-handler',
  templateUrl: './orcid-data-handler.component.html',
  styleUrls: ['./orcid-data-handler.component.scss']
})
export class OrcidDataHandlerComponent implements OnInit {
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  loaderValue = 0;
  loaderInterval: NodeJS.Timeout;
  success: boolean;
  @Output() cancel = new EventEmitter<boolean>();
  faCheckCircle = faCheckCircle;

  constructor() { }

  ngOnInit(): void {
    this.handleLoading();
  }

  handleLoading() {
    this.loaderInterval = setInterval(() => {
      this.loaderValue = this.loaderValue + 25;
      if (this.loaderValue >= 100) {
        setTimeout(() => {
          this.success = true;
        }, 1000);
        clearInterval(this.loaderInterval);
      }
    }, 300);
  }

  cancelHandler() {
    this.cancel.emit(true);
  }

}
