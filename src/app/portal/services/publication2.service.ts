import { inject, Injectable, LOCALE_ID, OnInit, SecurityContext } from '@angular/core';
// import { object, Output, parse, string } from 'valibot';
import { BehaviorSubject, forkJoin, Observable, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take, tap } from 'rxjs/operators';
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

type SearchParams = {
  q?: string[],
  page?: string[],
  size?: string[],
  year?: string[],
  organization?: string[],

  // placeholders
  publicationTypeCode?: string[],
  publicationStatusCode?: string[],
}

@Injectable({
  providedIn: 'root'
})
export class Publication2Service {
  http = inject(HttpClient);
  sanitizer = inject(DomSanitizer);
  locale = inject(LOCALE_ID);

  path = suffixer(this.locale);

  organizationNames$ = this.getOrganizationNames();

  searchParams = new BehaviorSubject<Record<string, string[]>>({});

  searchResults$: Observable<PublicationSearch> = this.searchParams.pipe(
    switchMap(searchParams => this.searchPublications(searchParams)),
    tap((data) => console.log("searchPublications", data)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  resultsTotal$ = this.searchResults$.pipe(
    map((data) => data.hits.total.value)
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

  getTotal() {
    return this.resultsTotal$;
  }

  getAggregations() {
    return this.publicationAggregations$;
  }

  updateSearchTerms(searchParams: Record<string, string[]>): void {
    this.searchParams.next(searchParams);
  }

  private searchPublications(searchParams: Record<string, string[]>): Observable<unknown> {
    const q = searchParams.q?.[0] ?? "";
    const page = parseInt(searchParams.page?.[0] ?? "1");
    const size = parseInt(searchParams.size?.[0] ?? "10");
    const from = (page - 1) * size;

    searchParams = searchParams as SearchParams; // TODO no effect?

    return this.http.post('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', {
      from: from,
      size: size,
      track_total_hits: true,
      query: {
        bool: {
          must: {
            ...matchingTerms(searchParams)
          },
          filter: {
            bool: {
              must: [
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams)
              ]
            }
          }
        },
      },
      highlight: {
        fields: {
          publicationName: {},
          authorsText: {},
          authorsTextSplitted: {},
          publisherName: {}
        },
        pre_tags: ["<em class=\"highlight\">"],
        post_tags: ["</em>"]
      },
      aggregations: {
        ...additionsFromYear(searchParams),
        ...additionsFromTypeCode(searchParams),
        ...additionsFromStatusCode(searchParams),
        ...additionsFromOrganization(searchParams)
      }
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

  getOrganizationNames(): Observable<Record<string, { name: string, sectorId: number }>> {
    const organizationNamesBySector = (sectorId: number) => ({
      'size': 0,
      'aggs': {
        'filtered_authors': {
          'nested': {
            'path': 'author'
          },
          'aggs': {
            'single_sector': {
              'filter': {
                'term': {
                  'author.sectorId': `${sectorId}`
                }
              },
              'aggs': {
                'organizations': {
                  'nested': {
                    'path': 'author.organization'
                  },
                  'aggs': {
                    'composite_orgs': {
                      'composite': {
                        'size': 65536,
                        'sources': [
                          { 'id': { 'terms': { 'field': 'author.organization.organizationId.keyword' } } },
                          { 'name': { 'terms': { 'field': 'author.organization.OrganizationNameFi.keyword' } } }        // TODO path template needed
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const sectorIds = [1, 2, 3, 4, /*5,*/ 6];

    const responses$ = sectorIds.map((sectorId) => {
      return this.http.post<OrgsAggsResponse>('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', organizationNamesBySector(sectorId)).pipe(
        map((res) => getOrganizationNameBuckets(res).map((bucket) => [bucket.key.id, {name: bucket.key.name, sectorId}])),
      );
    });

    return forkJoin(responses$)
      .pipe(map(responses => responses.flat()))
      .pipe(map(pairs => Object.fromEntries(pairs)))
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}

function matchingTerms(searchParams: SearchParams) {
  const q = (searchParams.q ?? [""])[0];

  if (q === "") {
    return {
      match_all: {}
    };
  }

  return {
    query_string: {
      query: q,
      fields: ["publicationName", "authorsText", "publisherName"],
      default_operator: "OR"
    }
  };
}

function termsForYear(searchParams: SearchParams) {
  if (searchParams.year) {
    return [{
      terms: {
        "publicationYear": searchParams.year
      }
    }];
  }
  return [];
}

function termsForTypeCode(searchParams: SearchParams) {
  if (searchParams.publicationTypeCode) {
    return [{
      terms: {
        "publicationTypeCode.keyword": searchParams.publicationTypeCode
      }
    }];
  }
  return [];
}

function termsForStatusCode(searchParams: SearchParams) {
  if (searchParams.publicationStatusCode) {
    return [{
      terms: {
        "publicationStatusCode.keyword": searchParams.publicationStatusCode
      }
    }];
  }
  return [];
}

// NOTE: additionsFrom functions must use all other "termsFor" functions but not its own

function additionsFromYear(searchParams: SearchParams) {
  return {
    "all_data_except_publicationYear": {
      "global": {},
      "aggregations": {
        "filtered_except_publicationYear": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForStatusCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_publicationYears": {
              "terms": {
                "field": "publicationYear",
                "size": 250,
              }
            }
          }
        }
      }
    }
  };
}

type YearAggregation = {
  all_data_except_publicationYear: {
    filtered_except_publicationYear: {
      all_publicationYears: {
        buckets: Array<{
          key: number;
          doc_count: number;
        }>;
      };
    };
  };
};

export function getYearAdditions(aggregations: YearAggregation) {
  return aggregations.all_data_except_publicationYear?.filtered_except_publicationYear.all_publicationYears.buckets ?? [];
}

function additionsFromTypeCode(searchParams: SearchParams) {
  return {
    "all_data_except_publicationTypeCode": {
      "global": {},
      "aggregations": {
        "filtered_except_publicationTypeCode": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_publicationTypeCodes": {
              "terms": {
                "field": "publicationTypeCode.keyword"
              }
            }
          }
        }
      }
    }
  };
}

function additionsFromStatusCode(searchParams: SearchParams) {
  return {
    "all_data_except_publicationStatusCode": {
      "global": {},
      "aggregations": {
        "filtered_except_publicationStatusCode": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForOrganization(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_publicationStatusCodes": {
              "terms": {
                "field": "publicationStatusCode.keyword"
              }
            }
          }
        }
      }
    }
  };
}

type OrganizationAggregation = {
  all_data_except_organizationId: {
    filtered_except_organizationId: {
      organization_nested: {
        all_organizationIds: {
          buckets: Array<{
            key: string;
            doc_count: number;
          }>;
        };
      };
    };
  };
};

export function getOrganizationAdditions(aggregations: OrganizationAggregation) {
  return aggregations.all_data_except_organizationId?.filtered_except_organizationId.organization_nested.all_organizationIds.buckets ?? [];
}

function suffixer(locale) {
  const capitalized = locale.charAt(0).toUpperCase() + locale.slice(1).toLowerCase();

  return strings => strings[0].replace(/(Fi|Sv|En)(?=\.|$)/g, capitalized);
}

const path = suffixer("fi");

function termsForOrganization(searchParams: SearchParams) {
  if (searchParams.organization && searchParams.organization.length > 0) {
    return [{
      "nested": {
        "path": "author",
        "query": {
          "bool": {
            "must": [
              {
                "terms": {
                  "author.organization.organizationId.keyword": searchParams.organization
                }
              }
            ]
          }
        }
      }
    }];
  }
  return [];
}

function additionsFromOrganization(searchParams: SearchParams) {
  return {
    "all_data_except_organizationId": {
      "global": {},
      "aggregations": {
        "filtered_except_organizationId": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "organization_nested": {
              "nested": {
                "path": "author"
              },
              "aggregations": {
                "all_organizationIds": {
                  "terms": {
                    "field": "author.organization.organizationId.keyword",
                    "size": 250,
                    // author.organization.OrganizationNameFi.keyword
                    // "field": i18n`author.organization.${"OrganizationName"}.keyword`
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

type OrgsAggsResponse = {
  aggregations: {
    filtered_authors: {
      single_sector: {
        organizations: {
          composite_orgs: {
            buckets: Array<{
              key: {
                id: string;
                name: string;
              };
              doc_count: number;
            }>;
          };
        };
      };
    };
  };
};

function getOrganizationNameBuckets(response: OrgsAggsResponse) {
  return response.aggregations.filtered_authors.single_sector.organizations.composite_orgs.buckets;
}

function toIdNameLookup(data: OrgsAggsResponse): Map<string, string> {
  const pairs = getOrganizationNameBuckets(data).map((bucket) => [bucket.key.id, bucket.key.name]);

  return Object.fromEntries(pairs);
}
