//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit {
  public singleId: any;
  responseData: any [];
  errorMessage = [];

  constructor( private route: ActivatedRoute, private singleService: SingleItemService ) {
    this.singleId = this.route.snapshot.params.id;
    this.singleService.getId(this.singleId);
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

}
