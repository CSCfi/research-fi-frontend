import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { Search } from 'src/app/portal/models/search.model';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/portal/services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { WINDOW } from 'src/app/shared/services/window.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';

@Component({
  selector: 'app-news-pagination',
  templateUrl: './news-pagination.component.html',
  styleUrls: ['./news-pagination.component.scss'],
})
export class NewsPaginationComponent implements OnInit, OnChanges {
  page: number;
  fromPage: number; // Used for HTML rendering
  pages: number[];
  maxPage: number;
  @Input() responseData: Search;
  @Input() tab: string;
  total: any;
  resizeSub: Subscription;
  desktop = this.window.innerWidth >= 1200;
  navSmall = this.window.innerWidth >= 992;
  order = this.window.innerWidth >= 768;
  pageSize = 5;

  previous = $localize`:@@previous:Edellinen`;
  next = $localize`:@@next:Seuraava`;
  paramSub: Subscription;

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router,
    private resizeService: ResizeService,
    @Inject(WINDOW) private window: Window,
    private tabChangeService: TabChangeService
  ) {}

  ngOnInit(): void {
    // Initialize fromPage
    this.fromPage = (this.page - 1) * this.pageSize;

    // Get updates for window resize
    this.resizeSub = this.resizeService.onResize$.subscribe((size) =>
      this.onResize(size)
    );
  }

  ngOnChanges() {
    // Reset pagination
    this.page = this.searchService.newsPageNumber;
    this.pages = this.generatePages(this.page, this.pageSize);
  }

  generatePages(currentPage: number, length: number = this.pageSize) {
    // Get the highest page number for the query
    this.maxPage = this.getHighestPage(this.responseData[0]?.total);
    // Init array to correct length, make it odd and squish if not enough pages
    // Number of pages should be odd to make centering current page easy
    // tslint:disable-next-line: curly
    if (!(length % 2)) length++;
    length = Math.min(length, this.maxPage);
    const res = Array(length);
    // If page is at end, count from top
    // tslint:disable-next-line: no-bitwise
    if (this.page > this.maxPage - ((length / 2) | 0)) {
      res[length - 1] = this.maxPage;
      for (let i = length - 2; i >= 0; i--) {
        res[i] = res[i + 1] - 1;
      }
      // Otherwise count from bottom
    } else {
      // tslint:disable-next-line: no-bitwise
      res[0] = Math.max(1, currentPage - ((length / 2) | 0));
      for (let i = 1; i < length; i++) {
        res[i] = res[i - 1] + 1;
      }
    }
    return res;
  }

  getHighestPage(results: number, interval: number = this.pageSize) {
    // tslint:disable-next-line: no-bitwise
    return ((results - 1) / interval + 1) | 0;
  }

  goToPage(n: number) {
    this.page = n;
    this.fromPage = (this.page - 1) * this.pageSize;
    this.searchService.updateNewsPageNumber(this.page);
    this.pages = this.generatePages(this.page, this.pageSize);
    this.tabChangeService.focus = 'olderNews';
    this.navigate();
  }

  onResize(size) {
    const w = size.width;
    // Change if swap to or from desktop
    const changePages =
      (this.desktop && w < 1200) || (!this.desktop && w >= 1200);
    this.desktop = w >= 1200;
    this.navSmall = w >= 992;
    this.order = w >= 768;
    // Generate 5 pages and 4 more if desktop (9 total for desktop so it's odd)
    if (changePages) {
      this.pages = this.generatePages(this.page, this.pageSize);
    }
  }

  navigate() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
  }
}
