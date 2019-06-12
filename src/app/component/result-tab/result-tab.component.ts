import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit {
  allData: any [];
  errorMessage: any [];
  selectedTab = '';

  constructor(private searchService: SearchService) { }

  ngOnInit() {
    // Get data for count-ups
    this.getAllData();
  }

  getAllData() {
    this.searchService.getAll()
    .pipe(map(allData => [allData]))
    .subscribe(allData => this.allData = allData,
      error => this.errorMessage = error as any);
  }

}
