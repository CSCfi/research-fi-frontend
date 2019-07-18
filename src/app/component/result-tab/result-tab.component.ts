import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, ViewChildren, QueryList, OnChanges } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('scroll') ref: QueryList<any>;
  @Input() allData: any;

  errorMessage: any [];
  selectedTab: any;
  tab: any;
  searchTerm: any;
  myOps = {
    duration: 0.5
  };

  // Variables related to scrolling logic
  scroll: ElementRef;
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
    // Add the scroll handler, passive to improve performance
    window.addEventListener('scroll', this.scrollEvent, {capture: true, passive: true});
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollEvent);
  }

  // Update scrollWidth and offsetWidth once data is available and DOM is rendered
  // https://stackoverflow.com/questions/34947154/angular-2-viewchild-annotation-returns-undefined
  ngOnChanges() {
    if (this.allData) {
      this.ref.changes.subscribe((result) => {
        this.scroll = result.first;
        // Timeout to prevent value changed exception
        setTimeout(() => {
          this.scrollWidth = this.scroll.nativeElement.scrollWidth;
          this.offsetWidth = this.scroll.nativeElement.offsetWidth;
        }, 1);
      });
    }
  }

  scrollEvent = (e: any): void => {
    if (this.scroll) {
      this.lastScrollLocation = this.scroll.nativeElement.scrollLeft;
    }
  }

  scrollLeft() {
    this.scroll.nativeElement.scrollLeft -= Math.max(150, 1 + (this.scrollWidth) / 4);
  }

  scrollRight() {
    this.scroll.nativeElement.scrollLeft += Math.max(150, 1 + (this.scrollWidth) / 4);
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
