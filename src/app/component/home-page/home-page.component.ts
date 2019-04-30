// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  responseData: any [];
  errorMessage = [];
  status = false;
  myOps = {
    duration: 0.5
  };

  constructor(private searchService: SearchService) {
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.searchService.getAll()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => this.responseData = responseData,
      error => this.errorMessage = error as any);
  }

  increaseEvent() {
    this.status = !this.status;
  }

}
