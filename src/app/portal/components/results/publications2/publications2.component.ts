import { Component, inject, OnDestroy } from '@angular/core';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from '@angular/common';
import {
  getOrganizationAdditions,
  getYearAdditions,
  HighlightedPublication,
  Publication2Service
} from '@portal/services/publication2.service';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-publications2',
  templateUrl: './publications2.component.html',
  styleUrls: ['./publications2.component.scss'],
  imports: [CdkTableModule, FormsModule, AsyncPipe, JsonPipe, NgForOf, NgIf],
  standalone: true
})
export class Publications2Component implements OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  publications2Service = inject(Publication2Service);

  keywords = "";

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


  organizationAdditions$ = this.aggregations$.pipe(
    map(aggs => getOrganizationAdditions(aggs).map((bucket: any) => ({ organization: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );


  searchParamsSubscription = this.searchParams$.subscribe(searchParams => {
    this.publications2Service.updateSearchTerms(searchParams);
  });

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

  previousPage() { // TODO

  }

  setPageSize(size: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageSize: size }, queryParamsHandling: 'merge'
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
