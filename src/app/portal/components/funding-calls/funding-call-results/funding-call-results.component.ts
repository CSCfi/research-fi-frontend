import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FundingCall } from '@portal/models/funding-call.model';
import { Search } from '@portal/models/search.model';
import { DataService } from '@portal/services/data.service';
import { SearchService } from '@portal/services/search.service';
import { SortService } from '@portal/services/sort.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-funding-call-results',
  templateUrl: './funding-call-results.component.html',
  styleUrls: ['./funding-call-results.component.scss']
})
export class FundingCallResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() resultData: Search;
  @Input() sortDirection: boolean;
  @Input() sortColumn: string;
  expandStatus: Array<boolean> = [];
  @ViewChild('main') mainContent: ElementRef;

  faIcon = this.tabChangeService.fundingCall.icon;
  input: string;
  inputSub: any;
  focusSub: any;
  marginTop = 0;
  heightSub: any;

  currentLocale: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sortService: SortService,
    @Inject(DOCUMENT) private document: any,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    public utilityService: UtilityService
  ) {
    this.currentLocale =
        this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit() {
    // Check url for sorting, default to empty
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.searchService.currentInput.subscribe((input) => {
      this.input = input;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    // Focus first element when clicked with skip-link
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main') {
          this.mainContent?.nativeElement.focus();
        }
      }
    );
    // this.heightSub = this.dataService.currentActiveFilterHeight?.subscribe(height => {
    //   if (height > 0) {
    //     this.marginTop = height;
    //     this.cdr.detectChanges();
    //   }
    // });
  }

  isReviewed(type: string) {
    if (!type) {
      return false;
    }
    return type[0] === 'A' || type[0] === 'C';
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    this.focusSub?.unsubscribe();
    this.heightSub?.unsubscribe();
  }
}
