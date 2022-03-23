import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Search } from 'src/app/portal/models/search.model';
import { SearchService } from 'src/app/portal/services/search.service';
import { SortService } from 'src/app/portal/services/sort.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss'],
})
export class DatasetsComponent implements OnInit {
  @Input() resultData: Search;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  @ViewChild('main') mainContent: ElementRef;

  faIcon = this.tabChangeService.tabData
    .filter((t) => t.data === 'datasets')
    .map((t) => t.icon)
    .pop();
  documentLang: any;
  input: string;
  inputSub: any;
  focusSub: any;
  marginTop = 0;
  heightSub: any;

  constructor(
    private route: ActivatedRoute,
    private sortService: SortService,
    @Inject(DOCUMENT) private document: any,
    private tabChangeService: TabChangeService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    public utilityService: UtilityService
  ) {
    this.documentLang = this.document.documentElement.lang;
  }

  ngOnInit() {
    // Check url for sorting, default to empty
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
    this.inputSub = this.searchService.currentInput.subscribe((input) => {
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
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
  }
}
