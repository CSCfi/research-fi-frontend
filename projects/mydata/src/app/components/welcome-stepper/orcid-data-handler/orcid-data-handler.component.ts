//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-orcid-data-handler',
  templateUrl: './orcid-data-handler.component.html',
  styleUrls: ['./orcid-data-handler.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrcidDataHandlerComponent implements OnInit {
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  loaderValue = 0;
  loaderInterval: NodeJS.Timeout;
  success: boolean;
  @Output() cancel = new EventEmitter<boolean>();
  @Output() dataFlag = new EventEmitter<boolean>();
  faCheckCircle = faCheckCircle;

  dataSchema = [
    { label: 'Yhteystiedot', fields: {}, expanded: true },
    { label: 'Tutkimustoiminnan kuvaus', fields: {} },
    { label: 'Affiliaatiot', fields: {} },
    { label: 'Koulutus', fields: {} },
    { label: 'Julkaisut', fields: {} },
    { label: 'Tutkimusaineistot', fields: {} },
    { label: 'Hankkeet', fields: {} },
    { label: 'Muut hankkeet', fields: {} },
    { label: 'Tutkimusinfrastruktuurit', fields: {} },
    { label: 'Muut tutkimusaktiviteetit', fields: {} },
    { label: 'Meriitit', fields: {} },
  ];

  constructor() {}

  ngOnInit(): void {
    this.handleLoading();
  }

  handleLoading() {
    this.loaderInterval = setInterval(() => {
      this.loaderValue = this.loaderValue + 25;
      if (this.loaderValue >= 100) {
        setTimeout(() => {
          this.success = true;
          this.setDataFlag();
        }, 1000);
        clearInterval(this.loaderInterval);
      }
    }, 300);
  }

  setDataFlag() {
    this.dataFlag.emit(true);
  }

  cancelHandler() {
    this.cancel.emit(true);
  }
}
