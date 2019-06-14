import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit {
  @Input() allData: any [];
  errorMessage: any [];
  selectedTab: any;
  tab: any;
  searchTerm: any;
  myOps = {
    duration: 0.5
  };

  tabData = this.tabChangeService.tabData;

  constructor(private route: ActivatedRoute, private router: Router, private tabChangeService: TabChangeService) {
    this.searchTerm = this.route.snapshot.params.input;
    this.selectedTab = this.route.snapshot.params.tab;
   }

  ngOnInit() {
    // Update active tab visual after change
    this.route.params.subscribe(params => {
      this.selectedTab = params.tab;
      this.searchTerm = params.input;
      // Update title based on selected tab
      this.tabData.forEach(tab => {
        if (tab.link === this.selectedTab) {
          this.tabChangeService.changeTab(tab);
        }
      });
    });
  }

  changeTab(tab) {
    if (!this.searchTerm) { this.searchTerm = ''; }
    this.router.navigate(['results/', tab.link, this.searchTerm]);
  }
}
