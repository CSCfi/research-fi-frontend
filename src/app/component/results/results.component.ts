import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Search } from '../../models/search.model';


const API_URL = environment.apiUrl;

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  restItems: any;
  restItemsUrl = API_URL;
  public data = {};
  input: any = [];
  isSearching: boolean;
  responseData: any [];
  errorMessage = [];

  constructor(private searchService: SearchService, private http: HttpClient, private router: Router) {
    this.isSearching = false;
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {

      }
    });
  }

  ngOnInit() {
    this.searchService.currentInput.subscribe(input => this.input = input);

    if (this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeFirstComponentFunction.subscribe(() => {

      });
    }

    this.searchService.getPublications()
    .pipe(
      map(responseData => [responseData])
      // map(responseData => [JSON.stringify(responseData)])
    )
    .subscribe(responseData => this.responseData = responseData,
      error => this.errorMessage = error as any);
  }

  generateArray(obj: { [x: string]: any; }) {
    return Object.keys(obj).map((key) => obj[key]);
 }

}
