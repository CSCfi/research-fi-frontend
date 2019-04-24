import { Component, OnInit } from '@angular/core';
import {Search} from '../../models/search.model';
import {ResultsService} from '../../services/results.service';

@Component({
  selector: 'app-test-results',
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.scss']
})
export class TestResultsComponent implements OnInit {

  results: Search[];

  constructor(private resultsService: ResultsService) {
    this.results = [];
  }

  ngOnInit() {
    this.resultsService.getPublications().pipe().subscribe(response => {
      this.results = response;
    });
  }

}
