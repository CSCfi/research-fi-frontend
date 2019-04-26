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
