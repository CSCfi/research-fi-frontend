//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit {
  searchTerm: any;
  tabLink: any = [];
  page: any;
  sortBy = 'desc';
  input: any;
  sortMethod: any;

  constructor( private route: ActivatedRoute, private router: Router, private searchService: SearchService ) {
    this.searchTerm = this.route.snapshot.params.input;

    // Subscribe to URL sort method
    this.route.queryParams.subscribe( queryParams  =>  {
      this.sortMethod = queryParams.sort;
    });

    this.sortMethod = localStorage.getItem('sortMethod');
    if (this.sortMethod ? undefined || null : this.sortMethod === 'desc') {}
   }

  ngOnInit() {
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.page = this.searchService.pageNumber;

    // Subscribe to route input parameter
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      this.searchTerm = term;
      this.tabLink = params.tab;
      this.searchService.getInput(this.searchTerm);
    });

  }

  orderBy(event: { target: { value: any; }; }): void {
    if (this.searchTerm ? undefined : this.searchTerm === '') {}
    this.sortBy = event.target.value;
    localStorage.removeItem('sortMethod');
    localStorage.setItem('sortMethod', this.sortBy);
    this.searchService.getSortMethod(this.sortBy);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
    this.router.navigate(['results/', this.tabLink, this.searchTerm], { queryParams: { page: 1, sort: this.sortBy } }));
  }

}
