import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit {
  @Input() allData: any [];
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

  constructor(private route: ActivatedRoute, private router: Router) {
    this.searchTerm = this.route.snapshot.params.input;
    this.selectedTab = this.route.snapshot.params.tab;
   }

  ngOnInit() {
    // Update active tab visual after change
    this.route.params.subscribe(params => {
      this.selectedTab = params.tab;
      this.searchTerm = params.input;
    });
  }

  changeTab(tab) {
    if (!this.searchTerm) this.searchTerm = '';
    this.router.navigate(['results/', tab, this.searchTerm]);
  }
}
