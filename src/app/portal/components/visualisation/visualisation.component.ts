//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  Inject,
  Input,
  ViewChild,
  ElementRef,
  TemplateRef,
  DOCUMENT
} from '@angular/core';
import { Visual } from 'src/app/portal/models/visualisation/visualisations.model';
import { NgIf } from '@angular/common';
import { WINDOW } from 'src/app/shared/services/window.service';
import { PieComponent } from './pie/pie.component';
import { BarComponent } from './bar/bar.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-visualisation',
    templateUrl: './visualisation.component.html',
    styleUrls: ['./visualisation.component.scss'],
    host: {
        '(window:resize)': 'onResize($event)'
    },
    imports: [NgIf, MatProgressSpinner, BarComponent, PieComponent]
})
export class VisualisationComponent implements OnInit {
  @ViewChild('main') main: ElementRef;
  @ViewChild('visualModal') modal: TemplateRef<any>;

  visType = 0;

  height = 0;
  width = 0;
  margin = 50;

  @Input() data: Visual;
  @Input() visIdx: number;
  @Input() loading: boolean;
  @Input() tab: string;
  @Input() percentage: boolean;
  @Input() searchTarget: string;
  @Input() searchTerm: string;
  @Input() visualisationType: boolean;
  title = '';
  saveClickBar = false;
  saveClickPie = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private window: Window,
  ) {}

  ngOnInit() {
    // Timeout waits for viewchild init
    setTimeout(() => {
      // Offset if wanted to be used to determine height
      const offset =
        this.main.nativeElement.getBoundingClientRect().y -
        this.document.body.getBoundingClientRect().y;
      // Arbitrary height, testing
      this.height = this.window.innerHeight - 300;
      this.width = (this.window.innerWidth - 100) * 0.75;
      // this.width = this.main.nativeElement.offsetWidth + 400;
      // this.openModal(this.modal);
    });
  }

  saveAsImageClick(){
    if (this.visualisationType){
      this.saveClickPie = !this.saveClickPie;
    }
    else {
      this.saveClickBar = !this.saveClickBar;
    }
  }

  onResize(event) {
    this.height = event.target.innerHeight  - 300;
    this.width = (event.target.innerWidth  - 100) * 0.75;
  }

  updateTitle(newTitle: string) {
    this.title = newTitle;
  }
}
