import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit, OnDestroy {
  @ViewChild('scroll') scroll: ElementRef;
  private _allData: any;
  @Input() set allData(value: any) {
    this._allData = value;
    setTimeout(() => {
      this.scrollWidth = this.scroll.nativeElement.scrollWidth;
      this.offsetWidth = this.scroll.nativeElement.offsetWidth;
    }, 1000);
  }
  get allData() { return this._allData; }

  errorMessage: any [];
  selectedTab: any;
  tab: any;
  searchTerm: any;
  myOps = {
    duration: 0.5
  };

  lastScrollLocation = 0;
  offsetWidth;
  scrollWidth;

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
    window.addEventListener('scroll', this.scrollEvent, true);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollEvent);
  }

  scrollEvent = (e: any): void => {
    this.lastScrollLocation = this.scroll.nativeElement.scrollLeft;
    console.log(this.offsetWidth + this.lastScrollLocation < this.scrollWidth);
  }

  onResize(event) {
    this.lastScrollLocation = this.scroll.nativeElement.scrollLeft;
    this.offsetWidth = this.scroll.nativeElement.offsetWidth;
    this.scrollWidth = this.scroll.nativeElement.scrollWidth;
  }

  changeTab(tab) {
    if (!this.searchTerm) { this.searchTerm = ''; }
    this.router.navigate(['results/', tab.link, this.searchTerm]);
  }
}
