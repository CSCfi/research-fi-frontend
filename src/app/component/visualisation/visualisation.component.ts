//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, Input, ViewChild, ElementRef } from '@angular/core';
import { Visual } from 'src/app/models/visualisation/visualisations.model';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from 'src/app/services/window.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  @ViewChild('main') main: ElementRef;

  visType = 0;

  height = 0;
  width = 0;
  margin = 50;
  
  @Input() data: Visual;
  @Input() visIdx: number;
  @Input() loading: boolean;
  @Input() tab: string;
  @Input() percentage: boolean;

  title = '';

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(WINDOW) private window: Window) {
  }
  
  ngOnInit() {
    // Timeout waits for viewchild init
    setTimeout(() => {
      // Offset if wanted to be used to determine height
      const offset = this.main.nativeElement.getBoundingClientRect().y - this.document.body.getBoundingClientRect().y; 
      // Arbitrary height, testing
      this.height = this.window.innerHeight - 100;
      this.width = this.main.nativeElement.offsetWidth;
    });
  }

  updateTitle(newTitle: string) {
    this.title = newTitle;
  }
}
