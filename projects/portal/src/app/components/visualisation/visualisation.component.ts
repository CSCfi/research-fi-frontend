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
} from '@angular/core';
import { Visual } from '@portal.models/visualisation/visualisations.model';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from 'ui-library';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss'],
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

  title = '';

  modalRef: BsModalRef;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private window: Window,
    private modalService: BsModalService
  ) {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'wide-modal' })
    );
  }

  closeModal() {
    this.modalRef.hide();
  }

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
      // console.log(this.main.nativeElement.offsetWidth)
      // this.openModal(this.modal);
    });
  }

  updateTitle(newTitle: string) {
    this.title = newTitle;
  }
}
