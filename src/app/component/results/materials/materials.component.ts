import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Search } from 'src/app/models/search.model';
import { DataService } from 'src/app/services/data.service';
import { SearchService } from 'src/app/services/search.service';
import { SortService } from 'src/app/services/sort.service';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  @Input() resultData: Search;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  @ViewChild('main') mainContent: ElementRef;

  faIcon = this.tabChangeService.tabData.filter(t => t.data === 'materials').map(t => t.icon).pop();
  documentLang: any;
  input: string;
  inputSub: any;
  focusSub: any;
  marginTop = 0;
  heightSub: any;

  constructor(private router: Router, private route: ActivatedRoute, private sortService: SortService,
              @Inject(DOCUMENT) private document: any, private tabChangeService: TabChangeService,
              private searchService: SearchService, private cdr: ChangeDetectorRef, private dataService: DataService,
              public utilityService: UtilityService) {
                this.documentLang = this.document.documentElement.lang;
               }

  ngOnInit() {
    // Check url for sorting, default to empty
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
    this.searchService.currentInput.subscribe(input => {
      this.input = input;
      this.cdr.detectChanges();
    });

  }

  ngAfterViewInit() {
    // Focus first element when clicked with skip-link
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main') {
        this.mainContent?.nativeElement.focus();
      }
    });
    // this.heightSub = this.dataService.currentActiveFilterHeight?.subscribe(height => {
    //   if (height > 0) {
    //     this.marginTop = height;
    //     this.cdr.detectChanges();
    //   }
    // });

  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    this.focusSub?.unsubscribe();
    this.heightSub?.unsubscribe();
  }
}
