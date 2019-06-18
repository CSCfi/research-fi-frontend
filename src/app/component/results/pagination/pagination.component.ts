import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  page: any;
  fromPage: number;
  searchTerm: any;
  paginationCheck: boolean;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private router: Router ) { }

  ngOnInit() {
  }

  nextPage() {
    this.page++;
    this.fromPage = this.page * 10 - 10;
    // Send to search service
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.router.navigate(['results/', 'publications', this.searchTerm], { queryParams: { page: this.page } });
    // this.getPublicationData();
    this.paginationCheck = true;
  }

  previousPage() {
    this.page--;
    this.fromPage = this.fromPage - 10;
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.router.navigate(['results/', 'publications', this.searchTerm], { queryParams: { page: this.page } });
    // this.getPublicationData();
    this.paginationCheck = true;
  }

}
