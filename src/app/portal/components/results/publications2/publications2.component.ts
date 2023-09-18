import { Component, inject, OnInit, SecurityContext } from '@angular/core';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPipe } from '@angular/common';

// highlighted (HTML based) data that contains the columns: ['publicationName', 'authorsText', 'publisherName', 'publicationYear'];
interface HighlightedPublication {
  publicationName: SafeHtml;
  authorsText: SafeHtml;
  authorsTextSplitted: SafeHtml;
  publisherName: SafeHtml;
  publicationYear: SafeHtml;
}

// function that creates a new HighlightedPublication from a search data that has
// the highlighted data in the Publications2Component exists in: this.route.snapshot.data.publications.hits.hits.highlight.{... names of the columns ...}
// fallback values are in: this.route.snapshot.data.publications.hits.hits._source.{... names of the columns ...}
// final fallback would be empty strings
// data is passed from the this.route.snapshot.data.publications.hits.hits

// sanitize values with: this.sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, this.someHtmlContent);

function createHighlightedPublication(searchData: any): HighlightedPublication {
  const sanitizer = inject(DomSanitizer);

  const values = {
    publicationName:      searchData.highlight?.publicationName?.[0] ?? searchData._source.publicationName ?? "",
    authorsText:          searchData.highlight?.authorsText?.[0]     ?? searchData._source.authorsText     ?? "",
    authorsTextSplitted:  searchData.highlight?.authorsText?.[0]     ?? searchData._source.authorsText     ?? "",
    publisherName:        searchData.highlight?.publisherName?.[0]   ?? searchData._source.publisherName   ?? "",
    publicationYear:      searchData.highlight?.publicationYear?.[0] ?? searchData._source.publicationYear ?? ""
  }

  return {
    publicationName: sanitizer.sanitize(SecurityContext.HTML, values.publicationName),
    authorsText: sanitizer.sanitize(SecurityContext.HTML, values.authorsText),
    authorsTextSplitted: sanitizer.sanitize(SecurityContext.HTML, values.authorsTextSplitted),
    publisherName: sanitizer.sanitize(SecurityContext.HTML, values.publisherName),
    publicationYear: sanitizer.sanitize(SecurityContext.HTML, values.publicationYear)
  }
}

@Component({
  selector: 'app-publications2',
  templateUrl: './publications2.component.html',
  styleUrls: ['./publications2.component.scss'],
  imports: [CdkTableModule, JsonPipe, FormsModule],
  standalone: true
})
export class Publications2Component {
  route = inject(ActivatedRoute);
  router = inject(Router);
  sanitizer = inject(DomSanitizer);

  displayedColumns: string[] = ['publicationName', 'authorsText', 'publisherName', 'publicationYear'];

  search = this.route.snapshot.data.publications;

  // publications: Publication[] = this.route.snapshot.data.publications.hits.hits.map(e => e._source);
  highlights: HighlightedPublication[] = this.route.snapshot.data.publications.hits.hits.map(e => createHighlightedPublication(e));

  dataSource = new PublicationDataSource(this.highlights);

  // queryParam 'page' parsed to number
  page: number = parseInt(this.route.snapshot.queryParams.page ?? 1);

  // queryParam 'pageSize' parsed to number
  pageSize: number = parseInt(this.route.snapshot.queryParams.pageSize?? 10);

  // queryParam 'q' assigned to keywords
  public keywords = this.route.snapshot.queryParams.q ?? "";

  constructor() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  searchKeywords(keywords: string) {
    this.router.navigate([], { queryParams: { q: keywords }, queryParamsHandling: 'merge' });
  }

  nextPage() {
    this.router.navigate([], { queryParams: { page: this.page + 1 }, queryParamsHandling: 'merge' });
  }

  previousPage() {
    this.router.navigate([], { queryParams: { page: Math.max(this.page - 1, 0) }, queryParamsHandling: 'merge' });
  }

  setPageSize(size: number) {
    this.router.navigate([], { queryParams: { pageSize: size }, queryParamsHandling: 'merge' });
  }
}

export class PublicationDataSource extends DataSource<HighlightedPublication> {
  data: BehaviorSubject<HighlightedPublication[]>;

  constructor(initialData: HighlightedPublication[]) {
    super();
    this.data = new BehaviorSubject(initialData);
  }

  connect(): Observable<HighlightedPublication[]> {
    return this.data;
  }

  disconnect() {
    this.data.complete();
  }
}
