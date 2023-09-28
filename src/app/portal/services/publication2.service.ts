import { inject, Injectable, OnInit, SecurityContext } from '@angular/core';
// import { object, Output, parse, string } from 'valibot';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/*const PublicationSearchSchema = object({
  publicationId: string(),
  title: string(),
});*/

type PublicationSearch = any; // Output<typeof PublicationSearchSchema>;

// function that validates API response into a PublicationSearch
function parsePublicationSearch(data: any): PublicationSearch {
  return data;
  // return parse(PublicationSearchSchema, data);
}

export interface HighlightedPublication {
  publicationName: SafeHtml;
  authorsText: SafeHtml;
  authorsTextSplitted: SafeHtml;
  publisherName: SafeHtml;
  publicationYear: SafeHtml;
}

type CachedPublicationSearch = {
  keywords: string,
  publicationSearch: PublicationSearch,
}

@Injectable({
  providedIn: 'root'
})
export class Publication2Service {
  http = inject(HttpClient);
  sanitizer = inject(DomSanitizer);

  searchParams = new BehaviorSubject<Record<string, string[]>>({});

  aggregations ={
    "by_publicationYear": {
      "terms": {
        "field": "publicationYear"
      }
    }
  }

  searchResults$: Observable<PublicationSearch> = this.searchParams.pipe(
    switchMap(searchParams => this.searchPublications(searchParams)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  publicationSearch$: Observable<PublicationSearch> = this.searchResults$.pipe(
    map((data) => parsePublicationSearch(data)),
    map((publicationSearch: PublicationSearch) => this.createHighlightedPublications(publicationSearch))
  );

  publicationAggregations$ = this.searchResults$.pipe(
    map((data) => data.aggregations)
  );

  getSearch() {
    return this.publicationSearch$;
  }

  getAggregations() {
    return this.publicationAggregations$;
  }

  updateSearchTerms(searchParams: Record<string, string[]>): void {
    this.searchParams.next(searchParams);
  }

  private searchPublications(searchParams: Record<string, string[]>): Observable<unknown> {                                 // TODO Observable<unknown> is more correct?
    const q = (searchParams.q ?? [""])[0];
    const page = parseInt(searchParams.page?.[0] ?? "1");
    const size = parseInt(searchParams.size?.[0] ?? "10");
    const from = (page - 1) * size;

    console.log("TIME TO BUILD AGGREGATIONS", searchParams);

    if (q === "") {
      return this.http.post('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', {
        "from": from,
        "size": size,
        "query": {
          "match_all": {}
        },
        "aggregations": this.aggregations
      });
    }

    return this.http.post('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', {
      "from": from,
      "size": size,
      "query": {
        "query_string": {
          "query": q,
          "fields": ["publicationName", "authorsText", "publisherName"],
          "default_operator": "OR"
        }
      },
      "highlight": {
        "fields": {
          "publicationName": {},
          "authorsText": {},
          "authorsTextSplitted": {},
          "publisherName": {}
        },
        "pre_tags": ["<em class=\"highlight\">"],
        "post_tags": ["</em>"]
      },
      "aggregations": this.aggregations
    });
  }

  createHighlightedPublications(searchData: PublicationSearch): HighlightedPublication[] {
    return searchData.hits.hits.map((hit: any/*ES doc for Publication*/) => this.createHighlightedPublication(hit));
  }

  createHighlightedPublication(searchData: any/*ES doc for Publication*/): HighlightedPublication {
    const values = {
      publicationName: searchData.highlight?.publicationName?.[0] ?? searchData._source.publicationName ?? '',
      authorsText: searchData.highlight?.authorsText?.[0] ?? searchData._source.authorsText ?? '',
      authorsTextSplitted: searchData.highlight?.authorsText?.[0] ?? searchData._source.authorsText ?? '',
      publisherName: searchData.highlight?.publisherName?.[0] ?? searchData._source.publisherName ?? '',
      publicationYear: searchData.highlight?.publicationYear?.[0] ?? searchData._source.publicationYear ?? ''
    };

    return {
      publicationName: this.sanitizer.sanitize(SecurityContext.HTML, values.publicationName),
      authorsText: this.sanitizer.sanitize(SecurityContext.HTML, values.authorsText),
      authorsTextSplitted: this.sanitizer.sanitize(SecurityContext.HTML, values.authorsTextSplitted),
      publisherName: this.sanitizer.sanitize(SecurityContext.HTML, values.publisherName),
      publicationYear: this.sanitizer.sanitize(SecurityContext.HTML, values.publicationYear)
    };
  }
}
