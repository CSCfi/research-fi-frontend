import { Component, inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from '@angular/common';
import {
  getLanguageCodeAdditions,
  getOrganizationAdditions, getPublicationAudienceAdditions, getPublicationFormatAdditions,
  getYearAdditions,
  HighlightedPublication,
  Publication2Service
} from '@portal/services/publication2.service';
import { map, take } from 'rxjs/operators';
import { SharedModule } from '@shared/shared.module';
import { SearchBar2Component } from '@portal/search-bar2/search-bar2.component';
import { NgArrayPipesModule } from 'ngx-pipes';
import { OrganizationFilterComponent } from '@portal/components/organization-filter/organization-filter.component';
import { FilterOptionComponent } from '@portal/components/filter-option/filter-option.component';
import { LimitPipe } from '@portal/pipes/limit.pipe';

@Component({
  selector: 'app-publications2',
  templateUrl: './publications2.component.html',
  styleUrls: ['./publications2.component.scss'],
  imports: [CdkTableModule, FormsModule, AsyncPipe, JsonPipe, NgForOf, NgIf, LimitPipe, NgArrayPipesModule,
    SharedModule, //TODO not good?
    FormsModule,
    SearchBar2Component, OrganizationFilterComponent, FilterOptionComponent
  ],
  standalone: true
})
export class Publications2Component implements OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  publications2Service = inject(Publication2Service);

  keywords = "";
  page = 1;
  size = 10;

  displayedColumns: string[] = ['publicationName', 'authorsText', 'publisherName', 'publicationYear'];

  highlights$ = this.publications2Service.getSearch(); // TODO: /*: Observable<HighlightedPublication[]>*/
  dataSource = new PublicationDataSource(this.highlights$);

  searchParams$ = this.route.queryParams.pipe( map(splitFields) );
  aggregations$ = this.publications2Service.getAggregations();

  yearAdditions$ = this.aggregations$.pipe(
    map(aggs => getYearAdditions(aggs).map((bucket: any) => ({ year: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.year - a.year))
  );

  yearFilters$ = combineLatest([this.yearAdditions$, this.searchParams$.pipe(map(params => params.year ?? []))]).pipe(
    map(([yearAdditions, enabledFilters]) => yearAdditions.map(yearAddition => ({
      year: yearAddition.year,
      count: yearAddition.count,
      enabled: enabledFilters.includes(yearAddition.year.toString())
    })))
  );

  organizationNames$ = this.publications2Service.getOrganizationNames();

  organizationAdditions$ = this.aggregations$.pipe(
    map(aggs => getOrganizationAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count})) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  organizationFilters$ = combineLatest([this.organizationAdditions$, this.organizationNames$, this.searchParams$.pipe(map(params => params.organization ?? []))]).pipe(
    map(([organizationAdditions, organizationNames, enabledFilters]) => organizationAdditions.map(organizationAddition => ({
      id: organizationAddition.id,
      count: organizationAddition.count,
      name: organizationNames[organizationAddition.id].name,
      sectorId: organizationNames[organizationAddition.id].sectorId,
      enabled: enabledFilters.includes(organizationAddition.id)
    })))
  );

  languageCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getLanguageCodeAdditions(aggs).map((bucket: any) => ({ languageCode: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  languageCodeFilters$ = combineLatest([this.languageCodeAdditions$, this.searchParams$.pipe(map(params => params.language ?? []))]).pipe(
    map(([languageCodeAdditions, enabledFilters]) => languageCodeAdditions.map(languageCodeAddition => ({
      name: languageCodeAddition.languageCode,
      count: languageCodeAddition.count,
      enabled: enabledFilters.includes(languageCodeAddition.languageCode)
    })))
  );

  publicationFormatNames$ = this.publications2Service.getPublicationFormatNames();

  publicationFormatAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationFormatAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publicationFormatFilters$ = combineLatest([this.publicationFormatAdditions$, this.publicationFormatNames$, this.searchParams$.pipe(map(params => params.format ?? []))]).pipe(
    map(([publicationFormatAdditions, publicationFormatNames, enabledFilters]) => publicationFormatAdditions.map(publicationFormatAddition => ({
      id: publicationFormatAddition.id,
      count: publicationFormatAddition.count,
      name: publicationFormatNames[publicationFormatAddition.id],
      enabled: enabledFilters.includes(publicationFormatAddition.id)
    })))
  );

  publicationAudienceNames$ = this.publications2Service.getPublicationAudienceNames();

  publicationAudienceAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationAudienceAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publicationAudienceFilters$ = combineLatest([this.publicationAudienceAdditions$, this.publicationAudienceNames$, this.searchParams$.pipe(map(params => params.audience ?? []))]).pipe(
    map(([publicationAudienceAdditions, publicationAudienceNames, enabledFilters]) => publicationAudienceAdditions.map(publicationAudienceAddition => ({
      id: publicationAudienceAddition.id,
      count: publicationAudienceAddition.count,
      name: publicationAudienceNames[publicationAudienceAddition.id],
      enabled: enabledFilters.includes(publicationAudienceAddition.id)
    })))
  );

  /* TODO localization solution */
  public sectorName = {
    1: "Yliopisto",
    2: "Ammattikorkeakoulu",
    3: "Tutkimuslaitos",
    4: "Yliopistollisen sairaalan erityisvastuualue",
    6: "Muu"
  }

  searchParamsSubscription = this.searchParams$.subscribe(searchParams => {
    this.publications2Service.updateSearchTerms(searchParams);

    this.keywords = searchParams.q?.[0] ?? "";
    this.page = parseInt(searchParams.page?.[0] ?? "1");
    this.size = parseInt(searchParams.size?.[0] ?? "10");
  });

  total$ = this.publications2Service.getTotal();

  ngOnDestroy() {
    this.searchParamsSubscription.unsubscribe();
  }

  toggleParam(key: string, value: string) {
    this.searchParams$.pipe(take(1)).subscribe(filterParams => {
      const queryParams = { ...filterParams };

      if (queryParams[key] == null) {
        queryParams[key] = [];
      }

      const index = queryParams[key].indexOf(value);

      if (index === -1) {
        queryParams[key].push(value);
      } else {
        queryParams[key].splice(index, 1);
      }

      if (queryParams[key].length === 0) {
        delete queryParams[key];
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: concatFields(queryParams)
      });
    });
  }

  searchKeywords(keywords: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: keywords }, queryParamsHandling: 'merge'
    });
  }

  nextPage() { // TODO CLEAN UP
    this.searchParams$.pipe(take(1)).subscribe(searchParams => {
      const queryParams = { ...searchParams };
      const page = parseInt(queryParams.page?.[0] ?? "1");
      queryParams.page = [`${page + 1}`];
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams
      });
    });
  }

  previousPage() { // TODO CLEAN UP
    this.searchParams$.pipe(take(1)).subscribe(searchParams => {
      const queryParams = { ...searchParams };
      const page = parseInt(queryParams.page?.[0] ?? "1");
      queryParams.page = [`${page - 1}`];
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams
      });
    });
  }

  public num = 0;

  setPageSize(size: number) {
    console.log(size);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { size }, queryParamsHandling: 'merge'
    });
  }
}

export class PublicationDataSource extends DataSource<HighlightedPublication> {
  constructor(private data$: Observable<HighlightedPublication[]>) {
    super();
  }

  connect(): Observable<HighlightedPublication[]> {
    return this.data$;
  }

  disconnect() { /**/ }
}

function concatParams(strings: string[]): string {
  return strings.sort().join(",");
}

function splitParams(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input.flatMap(item => item.split(","));
  }

  return input.split(",");
}

function splitFields(obj: Record<string, string | string[]>): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const key in obj) {
    const value = obj[key];
    result[key] = splitParams(value);
  }

  return result;
}

function concatFields(obj: Record<string, string[]>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    result[key] = concatParams(value);
  }

  return result;
}
