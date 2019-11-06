//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { TabChangeService } from '../../../services/tab-change.service';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-suggest',
  templateUrl: './suggest.component.html',
  styleUrls: ['./suggest.component.scss']
})
export class SuggestComponent implements OnInit, OnDestroy {
  suggests: any;
  responseData: any;
  errorMessage: any;
  currentTab: { data: string; labelFi: string; labelEn: string; link: string; icon: string; };
  tabSub: any;
  inputSub: any;
  dataSub: any;
  currentInput: any;

  constructor( private searchService: SearchService, public router: Router, private route: ActivatedRoute,
               private tabChangeService: TabChangeService ) {  }

  ngOnInit() {
    this.inputSub = this.searchService.currentInput.subscribe(input => {
      this.currentInput = input;
      console.log(this.currentInput);
      this.getResultData();
    });
    this.tabSub = this.tabChangeService.currentTab.subscribe(tab => this.currentTab = tab);
  }

  getResultData() {
    // Get data
    this.dataSub = this.searchService.getData()
    .pipe(map(responseData => [responseData]))
    .subscribe(
      responseData => {
        this.responseData = responseData,
        this.suggests = this.responseData[0].suggest.mySuggestions[0];
      }
    );
  }

  navigate(term) {
    this.searchService.singleInput = term;
    this.router.navigate(['results/', this.currentTab.data, term]);
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
    this.inputSub.unsubscribe();
    this.dataSub.unsubscribe();
  }
}
