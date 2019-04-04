import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { Post } from '../../post';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  user: Post[];
  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.dataService.getUsers().subscribe(users => {
      this.user = users;
      this.dataService.usersData = users;
    });
  }

  onSelectedFilter() {
    this.getFilteredExpenseList();
  }

  getFilteredExpenseList() {
    if (this.dataService.searchOption.length > 0) {
      this.user = this.dataService.filteredListOptions();
    } else {
      this.user = this.dataService.usersData;
    }
  }
}
