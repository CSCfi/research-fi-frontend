import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit {
  allData: any [];
  errorMessage: any [];
  selectedTab: any;
  searchTerm: any;
  myOps = {
    duration: 0.5
  };

  tabData = [
    { data: 'julkaisut', label: 'Julkaisut', link: 'publications' },
    { data: 'tutkijat',  label: 'Tutkijat', link: 'persons' },
    { data: 'hankkeet', label: 'Rahoitetut hankkeet', link: 'fundings' },
    { data: '', label: 'Tutkimusaineistot', link: '1' },
    { data: '', label: 'Tutkimusinfrastruktuurit', link: '2' },
    { data: '', label: 'Muut tutkimusaktiviteetit', link: '3' },
    { data: '', label: 'Tutkimusorganisaatiot', link: '4' }
  ];

  constructor(private searchService: SearchService, private route: ActivatedRoute, private router: Router) {
    this.searchTerm = this.route.snapshot.params.input;
    this.selectedTab = this.route.snapshot.params.tab;
   }

  ngOnInit() {
    // Get data for count-ups
    this.getAllData();

    // Update active tab visual after change
    this.route.params.subscribe(params => {
      this.selectedTab = params.tab;
    });
  }

  changeTab(tab) {
    if (!this.searchTerm) this.searchTerm = '';
    this.router.navigate(['results/', tab, this.searchTerm]);
  }

  getAllData() {
    this.searchService.getAll()
    .pipe(map(allData => [allData]))
    .subscribe(allData => this.allData = allData,
      error => this.errorMessage = error as any);
  }

}
