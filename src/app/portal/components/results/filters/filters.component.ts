//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  ViewChildren,
  QueryList,
  Inject,
  TemplateRef,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/shared/services/window.service';
import { UtilityService } from 'src/app/shared/services/utility.service';

import { PublicationFilterService } from 'src/app/portal/services/filters/publication-filter.service';
import { PersonFilterService } from 'src/app/portal/services/filters/person-filter.service';
import { FundingFilterService } from 'src/app/portal/services/filters/funding-filter.service';
import { DatasetFilterService } from 'src/app/portal/services/filters/dataset-filter.service';
import { InfrastructureFilterService } from 'src/app/portal/services/filters/infrastructure-filter.service';
import { OrganizationFilterService } from 'src/app/portal/services/filters/organization-filter.service';
import { NewsFilterService } from 'src/app/portal/services/filters/news-filter.service';
import { faSlidersH, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { isPlatformBrowser, DOCUMENT, NgTemplateOutlet, NgIf, NgFor, NgClass } from '@angular/common';
import { DataService } from 'src/app/portal/services/data.service';
import { FundingCallFilterService } from '@portal/services/filters/funding-call-filter.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { FilterConfigType } from 'src/types';
import { ConvertToArrayPipe } from '../../../pipes/convert-to-array.pipe';
import { ReplaceSpacePipe } from '../../../pipes/replace-space';
import { FilterItemPipe } from '../../../pipes/filter-item.pipe';
import { ThousandSeparatorPipe } from '../../../../shared/pipes/thousand-separator.pipe';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepickerToggleIcon, MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SecondaryButtonComponent } from '../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { ProjectFilterService } from '@portal/services/filters/project-filter.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    SecondaryButtonComponent,
    NgTemplateOutlet,
    NgIf,
    MatProgressSpinner,
    FontAwesomeModule,
    NgFor,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    NgClass,
    MatExpansionPanelTitle,
    TooltipModule,
    MatSlideToggle,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatIcon,
    MatDatepickerToggleIcon,
    MatDatepicker,
    MatSelectionList,
    MatListOption,
    MatButton,
    RouterLink,
    DialogComponent,
    ThousandSeparatorPipe,
    FilterItemPipe,
    ReplaceSpacePipe,
    ConvertToArrayPipe,
  ],
})
export class FiltersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() responseData: any;
  @Input() filterOrigin: string;
  @Input() filtersConfig: FilterConfigType[];
  @Input() showButton: boolean;
  @Input() headingText: string;

  @Input() set externalFilterQuery(externalFilterQuery: any) {
    if (externalFilterQuery && externalFilterQuery?.keys?.length > 0) {
      this.selectionChange('field', externalFilterQuery.keys, false);
    } else {
      this.clearFundingCallFilters();
    }
  }

  @ViewChildren('filterSearch') filterSearch: QueryList<ElementRef>;
  @ViewChild('openFilters', { read: ElementRef }) openFiltersButton: ElementRef;

  currentFilter: any[];
  currentSingleFilter: any[];
  parentPanel: string;
  subPanel: string;
  height: number;
  filterSub: any;
  resizeSub: any;
  width = this.window.innerWidth;
  mobile: boolean;
  activeFilters: any;
  queryParamSub: Subscription;
  visualFilterSub: Subscription;
  subFilters: MatSelectionList[];
  totalCount = 0;
  faSlidersH: any = faSlidersH;
  faPlus = faPlus;
  faMinus = faMinus;
  panelHeight = 'auto';
  panelArr = [];
  showMoreCount: any;
  filterTerm: any;
  fromYear: any;
  toYear: any;
  paramSub: Subscription;
  currentInput: string;
  defaultOpen = 7;
  activeElement: any;
  filterSearchHeader = $localize`:@@filterSearchHeader:Rajaa hakua`;
  filterNewsHeader = $localize`:@@filterNewsHeader:Rajaa uutisia`;
  coPublicationTooltip =
    'Valitsemalla ”näytä vain yhteisjulkaisut” voit tarkastella suomalaisten organisaatioiden yhteisiä julkaisuja. Hakutulos näyttää tällöin vain sellaiset julkaisut, joissa kaikki alla olevasta listasta valitut organisaatiot ovat mukana. Jos yhtään organisaatiota ei ole valittu, hakutulos näyttää kaikki yhteisjulkaisut';
  mobileStatusSub: Subscription;

  showDialog: boolean;
  dialogTemplate: TemplateRef<any>;
  dialogTitle: string;
  filterHeading: string;

  constructor(
    private router: Router,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    public utilityService: UtilityService,
    private sortService: SortService,
    private publicationFilters: PublicationFilterService,
    private personFilters: PersonFilterService,
    private fundingFilters: FundingFilterService,
    private datasetFilters: DatasetFilterService,
    private infrastructureFilters: InfrastructureFilterService,
    private organizationFilters: OrganizationFilterService,
    private fundingCallFilters: FundingCallFilterService,
    private projectFilters: ProjectFilterService,
    private newsFilters: NewsFilterService,
    @Inject(PLATFORM_ID) private platformId: object,
    private dataService: DataService,
    private appSettingsService: AppSettingsService
  ) {
    this.showMoreCount = [];
  }

  openDialog(template: TemplateRef<any>) {
    this.showDialog = true;
    this.dialogTemplate = template;
    this.dialogTitle = this.filterHeading;
  }

  closeDialog() {
    this.showDialog = false;
  }

  ngOnInit() {
    this.filterHeading = this.headingText
      ? this.headingText
      : this.filterOrigin === 'news'
        ? this.filterNewsHeader
        : this.filterSearchHeader;

    // Visualisation click filtering
    this.visualFilterSub = this.dataService.newFilter.subscribe((f) =>
      this.selectionChange(f.filter, f.key, true)
    );

    // Subscribe to queryParams
    this.queryParamSub = this.route.queryParams.subscribe((params) => {
      this.activeFilters = params;
    });

    this.paramSub = this.route.params.subscribe((params) => {
      if (this.currentInput !== params.input || !params.input) {
        this.currentInput = params.input;
      }
    });

    // Handle mobile status
    this.mobileStatusSub = this.appSettingsService.mobileStatus.subscribe(
      (status: boolean) => {
        this.mobile = status;
      }
    );
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.visualFilterSub?.unsubscribe();
      this.filterSub?.unsubscribe();
      this.resizeSub?.unsubscribe();
      this.queryParamSub?.unsubscribe();
      this.paramSub?.unsubscribe();
      this.mobileStatusSub?.unsubscribe();
    }
  }

  ngOnChanges() {
    // Save active element
    if (isPlatformBrowser(this.platformId)) {
      this.activeElement = this.document.activeElement.id;
    }

    // Initialize data and set filter data by index
    if (this.responseData) {
      // Set filters and shape data
      switch (this.filterOrigin) {
        case 'publications': {
          this.currentFilter = this.publicationFilters.filterData;
          this.currentSingleFilter = this.publicationFilters.singleFilterData;
          this.publicationFilters.shapeData(
            this.responseData,
            this.activeFilters
          );
          break;
        }
        case 'persons': {
          this.currentFilter = this.personFilters.filterData;
          this.currentSingleFilter = this.personFilters.singleFilterData;
          this.personFilters.shapeData(this.responseData);
          break;
        }
        case 'fundings': {
          this.currentFilter = this.fundingFilters.filterData;
          this.currentSingleFilter = this.fundingFilters.singleFilterData;
          this.fundingFilters.shapeData(this.responseData);
          break;
        }
        case 'datasets': {
          this.currentFilter = this.datasetFilters.filterData;
          this.currentSingleFilter = this.datasetFilters.singleFilterData;
          this.datasetFilters.shapeData(this.responseData);
          break;
        }
        case 'infrastructures': {
          this.currentFilter = this.infrastructureFilters.filterData;
          this.currentSingleFilter =
            this.infrastructureFilters.singleFilterData;
          this.infrastructureFilters.shapeData(this.responseData);
          break;
        }
        case 'organizations': {
          this.currentFilter = this.organizationFilters.filterData;
          this.currentSingleFilter = this.organizationFilters.singleFilterData;
          this.organizationFilters.shapeData(this.responseData);
          break;
        }
        case 'fundingCalls': {
          this.currentFilter = this.fundingCallFilters.filterData;
          this.currentSingleFilter = this.fundingCallFilters.singleFilterData;
          this.fundingCallFilters.shapeData(this.responseData);
          break;
        }
        case 'projects': {
          this.currentFilter = this.projectFilters.filterData;
          this.currentSingleFilter = this.projectFilters.singleFilterData;
          this.projectFilters.shapeData(this.responseData);
          break;
        }
        case 'news': {
          this.currentFilter = this.newsFilters.filterData;
          // this.currentSingleFilter = this.newsFilters.singleFilterData;
          this.newsFilters.shapeData(this.responseData);
          break;
        }
        // MyData filters
        case 'dataSources': {
          this.currentFilter = this.filtersConfig;
          break;
        }
      }
      // Restore focus after clicking a filter.
      // Id might have special characters and therefore [id=''] is used in selector.
      if (this.activeElement && isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          (
            this.document.querySelector(
              `[id='${this.activeElement}']`
            ) as HTMLElement
          )?.focus();
        }, 1);
      }
    }
  }

  clearFundingCallFilters() {
    // Merge selection with active filters and navigate
    let selectedFilters: any = {};
    const merged = Object.assign({}, this.activeFilters, selectedFilters);
    if (merged.field) {
      merged.field = [];
    }
    this.router.navigate([], {
      queryParams: merged,
      queryParamsHandling: 'merge',
    });
  }

  // Navigate with selected filters. Results.component catches query parameters for filters.
  // Supports key inputs as string or as an array

  selectionChange(filterName, key, forceOn = false) {
    let selectedFilters: any = {};
    // Reset selected filters
    if (!this.activeFilters[filterName]) {
      selectedFilters[filterName] = [];
    }
    // Key comes as an array from selectAll method, single selects are strings
    if (Array.isArray(key)) {
      selectedFilters[filterName] = key;
      // selectedFilters[filter].length > 0 ? selectedFilters[filter].concat(key)
    } else {
      // Filters cause problems if different data types
      key = key.toString();
      // Transform single active filter into array
      if (
        this.activeFilters[filterName] &&
        !Array.isArray(this.activeFilters[filterName])
      ) {
        const transformed = [];
        transformed[filterName] = [this.activeFilters[filterName]];
        this.activeFilters = transformed;
        selectedFilters = this.activeFilters;
      }
      // Merge selection with active filter of dynamic key
      if (this.activeFilters[filterName]) {
        const combined = this.activeFilters[filterName].concat(
          selectedFilters[filterName] ? selectedFilters[filterName] : []
        );
        selectedFilters[filterName] = [...new Set(combined)];
      }

      // Remove filter if selection exists
      if (
        selectedFilters[filterName] &&
        selectedFilters[filterName].includes(key)
      ) {
        // If new filter is not forced on (visualisations)
        if (!forceOn) {
          selectedFilters[filterName].splice(
            selectedFilters[filterName].indexOf(key),
            1
          );
        }
      } else {
        // Add new filter
        if (
          selectedFilters[filterName] &&
          selectedFilters[filterName].length > 0
        ) {
          selectedFilters[filterName].push(key);
        } else {
          selectedFilters[filterName] = [key];
        }
      }
    }
    // Set sort and page
    selectedFilters.sort = this.sortService.sortMethod;
    selectedFilters.page = 1;

    // Merge selection with active filters and navigate
    const merged = Object.assign({}, this.activeFilters, selectedFilters);
    this.router.navigate([], {
      queryParams: merged,
      queryParamsHandling: 'merge',
    });
  }

  selectAll(filter, subFilter) {
    // Push subfilter items into array
    const itemArr = [];
    subFilter.subData.forEach((item) => {
      itemArr.push(item.key.toString());
    });
    let result = [];
    // Check if all items already selected
    if (this.activeFilters[filter]) {
      const allSelected = itemArr.every(
        (value) => this.activeFilters[filter].indexOf(value) >= 0
      );
      // Create new set from active filters, prevents push to activeFilters
      result = [...new Set(this.activeFilters[filter])];
      if (allSelected) {
        // Remove all from active
        itemArr.forEach((item) => result.splice(result.indexOf(item), 1));
      } else {
        // Add all new selections and remove duplicates
        result.push(...itemArr);
        result = [...new Set(result)];
      }
    } else {
      result = itemArr;
    }
    // Pass selection
    this.selectionChange(filter, result);
  }

  rangeChange(event, dir) {
    // Set range query param to active filters, helps with active filters component. This query param doesn't do anything in filter service.
    const obj = {};
    let newFilters = {};
    obj[dir] = event.value ? dir.slice(0, 1) + event.value : null;
    newFilters = Object.assign({}, this.activeFilters, obj);
    this.activeFilters = newFilters;
  }

  range(event, dir) {
    // Range filter works only for years for now. Point is to get data from aggregation, perform selection based on range direction
    // and push new range as array. Range selection overrides single year selects but single selection can be made after range selection.
    const source = this.responseData.aggregations.year.buckets;
    const selected = [];
    switch (dir) {
      case 'from': {
        this.fromYear = event.value;
        if (event.value) {
          this.toYear
            ? source.map((x) =>
              x.key >= event.value && x.key <= this.toYear
                ? selected.push(x.key.toString())
                : null
            )
            : source.map((x) =>
              x.key >= event.value ? selected.push(x.key.toString()) : null
            );
        } else {
          source.map((x) =>
            x.key <= this.toYear ? selected.push(x.key.toString()) : null
          );
        }
        break;
      }
      case 'to': {
        this.toYear = event.value;
        if (event.value) {
          this.fromYear
            ? source.map((x) =>
              x.key <= event.value && x.key >= this.fromYear
                ? selected.push(x.key.toString())
                : null
            )
            : source.map((x) =>
              x.key <= event.value ? selected.push(x.key.toString()) : null
            );
        } else {
          source.map((x) =>
            x.key >= this.fromYear ? selected.push(x.key.toString()) : null
          );
        }
        break;
      }
    }
    this.selectionChange('year', selected);
  }

  dateChange(event, dir) {
    let start = this.getActiveDate('start')?.toLocaleDateString('sv');
    let end = this.getActiveDate('end')?.toLocaleDateString('sv');
    switch (dir) {
      case 'start': {
        start = event?.value?.toLocaleDateString('sv') || ''; // In case new value is null
        break;
      }
      case 'end': {
        end = event?.value?.toLocaleDateString('sv') || ''; // In case new value is null
        break;
      }
    }
    // Create filter string format
    const filterString = start || end ? (start || '') + '|' + (end || '') : ''; // Replace 'undefined' with empty string. On manual clear, empty string for the whole thing.
    // this.activeFilters = Object.assign({}, this.activeFilters, {date: [filterString]});
    this.selectionChange('date', [filterString]);
  }

  getActiveDate(dir) {
    // Initially string, then array. Convert into same format regardless
    const activeDate = [...(this.activeFilters.date || [])].join('');
    const start = activeDate?.split('|')[0] // Check if active start date exists
      ? new Date(activeDate?.split('|')[0])
      : null;
    const end = activeDate?.split('|')[1] // Check if active end date exists
      ? new Date(activeDate?.split('|')[1])
      : null;
    return dir === 'start' ? start : end;
  }

  filterInput(event, parent) {
    const term =
      event.target.value.length > 0 ? event.target.value.toLowerCase() : '';
    const source = this.responseData.aggregations[parent];
    source.original = source.original ? source.original : source.buckets;
    const matchArr = source.original.filter((item) =>
      (item.label ? item.label : item.key)
        .toString()
        .toLowerCase()
        .includes(term)
    );
    if (matchArr.length > 0) {
      source.buckets = matchArr;
      this.showMoreCount[parent] = {
        count: term.length ? matchArr.length : this.defaultOpen,
      };
    } else {
      source.buckets = [];
      this.showMoreCount[parent] = { count: this.defaultOpen };
    }
    // Set term per parent
    source.filterTerm = term;
  }

  subFilterInput(event, parent, child) {
    const term =
      event.target.value.length > 0 ? event.target.value.toLowerCase() : '';
    // this.filterTerm = term;
    const source = this.responseData.aggregations[parent].buckets.find(
      (sub) => sub.key === child
    );
    source.original = source.original ? source.original : source.subData;
    const matchArr = source.original.filter((subItem) =>
      subItem.label.toLowerCase().includes(term)
    );
    if (matchArr.length > 0) {
      source.subData = matchArr;
      this.showMoreCount[child] = {
        count: term.length ? matchArr.length : this.defaultOpen,
      };
    } else {
      source.subData = [];
      this.showMoreCount[child] = { count: this.defaultOpen };
    }
    // Set term per parent
    source.filterTerm = term;
  }

  setOpenStatus(parent) {
    this.currentFilter.find((item) => item.field === parent).open = true;
  }

  closePanel(parent) {
    this.currentFilter.find((item) => item.field === parent).open = false;
  }

  showMore(parent) {
    this.showMoreCount[parent] = this.showMoreCount[parent]
      ? { count: this.showMoreCount[parent].count + this.defaultOpen }
      : { count: this.defaultOpen * 2 };
  }

  showLess(parent) {
    this.showMoreCount[parent] = {
      count: this.showMoreCount[parent].count - this.defaultOpen,
    };
  }

  trackByFn(index: any, item) {
    return item.key;
  }
}
