//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit, AfterViewInit {
  public singleId: any;
  responseData: any [];
  errorMessage = [];
  @ViewChild('resultTitle') resultTitle: ElementRef;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private titleService: Title ) {
    this.singleId = this.route.snapshot.params.id;
    this.singleService.getId(this.singleId);
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.singleService.getSingle()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => this.responseData = responseData,
      error => this.errorMessage = error as any);
  }

  ngAfterViewInit() {
    // Set title according to result title. Should avoid timeout?
    setTimeout(() => {
      this.setTitle(this.resultTitle.nativeElement.innerHTML + ' - Julkaisut - Haku Tutkimustietovaranto');
    }, 100);
  }

}
