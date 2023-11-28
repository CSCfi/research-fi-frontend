import { inject, Injectable, LOCALE_ID, OnInit, SecurityContext } from '@angular/core';
// import { object, Output, parse, string } from 'valibot';
import { BehaviorSubject, forkJoin, Observable, of, shareReplay } from 'rxjs';
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

  language?: string[],
  format?: string[],
  audience?: string[],
  peerReviewed?: string[],

  // new terms
  parentPublicationType?: string[],
  international?: string[],
  articleType?: string[],
  jufo?: string[],

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

  // organizationNames$ = this.getOrganizationNames();

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
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
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
        ...additionsFromOrganization(searchParams),
        ...additionsFromLanguageCode(searchParams),
        ...additionsFromPublicationFormat(searchParams),
        ...additionsFromPublicationAudience(searchParams),
        ...additionsFromPeerReviewed(searchParams),
        ...additionsFromParentPublicationType(searchParams),
        ...additionsFromInternationalPublication(searchParams),
        ...additionsFromArticleTypeCode(searchParams),
        ...additionsFromJufoClassCode(searchParams)
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

/*
"terms": {
  "field": "languages.languageFi.keyword",
  "size": 1000
}
*/

  getLanguageCodeNames(): Observable<Record<string, string>> {
    const body = {
      'size': 0,
      'aggs': {
        'composite_pairs': {
          'composite': {
            'size': 1000,
            'sources': [
              { 'id': { 'terms': { 'field': 'languages.languageCode.keyword' } } },
              { 'nameFiLanguage': { 'terms': { 'field': 'languages.languageFi.keyword' } } }
            ]
          }
        }
      }
    };

    type LanguageAggregation = {
      aggregations: {
        composite_pairs: {
          buckets: Array<{
            key: {
              id: string;
              nameFiLanguage: string;
            };
            doc_count: number;
          }>;
        };
      };
    };

    const response$ = this.http.post<LanguageAggregation>('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', body);

    return response$.pipe(
      map((res) => res.aggregations.composite_pairs.buckets.map((bucket) => [bucket.key.id, bucket.key.nameFiLanguage])),  // TODO localized path needed
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getPublicationFormatNames(): Observable<Record<string, string>> {
    const body = {
      'size': 0,
      'aggs': {
        'composite_pairs': {
          'composite': {
            'size': 1000,
            'sources': [
              { 'id': { 'terms': { 'field': 'publicationFormat.id.keyword' } } },
              { 'nameFiFormat': { 'terms': { 'field': 'publicationFormat.nameFiPublicationFormat.keyword' } } }
            ]
          }
        }
      }
    };

    type PublicationFormatAggregation = {
      aggregations: {
        composite_pairs: {
          buckets: Array<{
            key: {
              id: string;
              nameFiFormat: string;
            };
            doc_count: number;
          }>;
        };
      };
    };

    const response$ = this.http.post<PublicationFormatAggregation>('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', body);

    return response$.pipe(
      map((res) => res.aggregations.composite_pairs.buckets.map((bucket) => [bucket.key.id, bucket.key.nameFiFormat])),  // TODO localized path needed
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getPublicationAudienceNames(): Observable<Record<string, string>> {
    const body = {
      'size': 0,
      'aggs': {
        'composite_pairs': {
          'composite': {
            'size': 1000,
            'sources': [
              { 'id': { 'terms': { 'field': 'publicationAudience.id.keyword' } } },
              { 'nameFiAudience': { 'terms': { 'field': 'publicationAudience.nameFiPublicationAudience.keyword' } } }
            ]
          }
        }
      }
    };

    type PublicationAudienceAggregation = {
      aggregations: {
        composite_pairs: {
          buckets: Array<{
            key: {
              id: string;
              nameFiAudience: string;
            };
            doc_count: number;
          }>;
        };
      };
    };

    const response$ = this.http.post<PublicationAudienceAggregation>('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', body);

    return response$.pipe(
      map((res) => res.aggregations.composite_pairs.buckets.map((bucket) => [bucket.key.id, bucket.key.nameFiAudience])),  // TODO localized path needed
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

// getParentPublicationTypeNames
// getInternationalPublicationNames
// getArticleTypeCodeNames


  getParentPublicationTypeNames(): Observable<Record<string, string>> {
    const body = {
      "size": 0,
      "aggs": {
        "composite_pairs": {
          "composite": {
            "size": 1000,
            "sources": [
              { "id": { "terms": { "field": "parentPublicationType.id.keyword" } } },
              { "nameFiParentPublicationType": { "terms": { "field": "parentPublicationType.nameFiParentPublicationType.keyword" } } }
            ]
          }
        }
      }
    }

    type ParentPublicationTypeAggregation = {
      aggregations: {
        composite_pairs: {
          buckets: Array<{
            key: {
              id: string;
              nameFiParentPublicationType: string;
            };
            doc_count: number;
          }>;
        };
      };
    };

    const response$ = this.http.post<ParentPublicationTypeAggregation>('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', body);

    return response$.pipe(
      map((res) => res.aggregations.composite_pairs.buckets.map((bucket) => [bucket.key.id, bucket.key.nameFiParentPublicationType])),  // TODO localized path needed
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getPeerReviewedNames(): Observable<Record<string, string>> {
    return of({
      "0": "Ei-vertaisarvioitu", // TODO use localize``
      "1": "Vertaisarvioitu"     // TODO use localize``
    });
  }

  getInternationalPublicationNames(): Observable<Record<string, string>> {
    return of({
      "0": "Kotimainen julkaisu",    // TODO use localize``
      "1": "Kansainvälinen julkaisu" // TODO use localize``
    });
  }

  getArticleTypeCodeNames(): Observable<Record<string, string>> {
    return of({
      "0": "Lehti",       // TODO use localize``
      "1": "Kokoomateos", // TODO use localize``
      "2": "Konferenssi", // TODO use localize``
      "3": "Verkkoalusta" // TODO use localize``
    });
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

function termsForLanguageCode(searchParams: SearchParams) {
  if (searchParams.language) {
    return [{
      terms: {
        "languages.languageCode.keyword": searchParams.language
      }
    }];
  }
  return [];
}

function termsForPublicationFormat(searchParams: SearchParams) {
  if (searchParams.format) {
    return [{
      terms: {
        "publicationFormat.id.keyword": searchParams.format
      }
    }];
  }
  return [];
}

function termsForPublicationAudience(searchParams: SearchParams) {
  if (searchParams.audience) {
    return [{
      terms: {
        "publicationAudience.id.keyword": searchParams.audience
      }
    }];
  }
  return [];
}

/* Peer reviewed
"terms": {
  "field": "peerReviewed.id.keyword",
  "size": 100
}
*/
function termsForPeerReviewed(searchParams: SearchParams) {
  if (searchParams.peerReviewed) {
    return [{
      terms: {
        "peerReviewed.id.keyword": searchParams.peerReviewed
      }
    }];
  }
  return [];
}

/* Parent Publication Type
{
  "size": 0,
  "aggs": {
    "parentPublicationType": {
      "terms": {
        "field": "parentPublicationType.id.keyword",
        "size": 100
      }
    }
  }
}
*/
function termsForParentPublicationType(searchParams: SearchParams) {
  if (searchParams.parentPublicationType) {
    return [{
      terms: {
        "parentPublicationType.id.keyword": searchParams.parentPublicationType
      }
    }];
  }
  return [];
}

/* International Publication
"terms": {
  "field": "internationalPublication",
  "size": 100
}
*/
function termsForInternationalPublication(searchParams: SearchParams) {
  if (searchParams.international) {
    return [{
      terms: {
        "internationalPublication": searchParams.international
      }
    }];
  }
  return [];
}

/*
"terms": {
  "field": "articleTypeCode",
  "size": 100
}
*/
function termsForArticleTypeCode(searchParams: SearchParams) {
  if (searchParams.articleType) {
    return [{
      terms: {
        "articleTypeCode": searchParams.articleType
      }
    }];
  }
  return [];
}

/*
"jufoClassCode": {
  "terms": {
    "field": "jufoClassCode.keyword",
      "size": 100
  }
}
*/
function termsForJufoClassCode(searchParams: SearchParams) {
  if (searchParams.jufo) {
    return [{
      terms: {
        "jufoClassCode.keyword": searchParams.jufo
      }
    }];
  }
  return [];
}

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
                ...termsForStatusCode(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
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
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
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
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
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

function additionsFromLanguageCode(searchParams: SearchParams) {
  return {
    "all_data_except_languageCode": {
      "global": {},
      "aggregations": {
        "filtered_except_languageCode": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_languageCodes": {
              "terms": {
                "field": "languages.languageCode.keyword"
              }
            }
          }
        }
      }
    }
  };
}

function additionsFromPublicationFormat(searchParams: SearchParams) {
  return {
    "all_data_except_publicationFormat": {
      "global": {},
      "aggregations": {
        "filtered_except_publicationFormat": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_publicationFormats": {
              "terms": {
                "field": "publicationFormat.id.keyword",
                "size": 1000,
              }
            }
          }
        }
      }
    }
  };
}

function additionsFromPublicationAudience(searchParams: SearchParams) {
  return {
    "all_data_except_publicationAudience": {
      "global": {},
      "aggregations": {
        "filtered_except_publicationAudience": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_publicationAudiences": {
              "terms": {
                "field": "publicationAudience.id.keyword"
              }
            }
          }
        }
      }
    }
  };
}

function additionsFromPeerReviewed(searchParams: SearchParams) {
  return {
    "all_data_except_peerReviewed": {
      "global": {},
      "aggregations": {
        "filtered_except_peerReviewed": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_peerReviewed": {
              "terms": {
                "field": "peerReviewed.id.keyword",
                "size": 100
              }
            }
          }
        }
      }
    }
  };
}

function additionsFromParentPublicationType(searchParams: SearchParams) {
  return {
    "all_data_except_parentPublicationType": {
      "global": {},
      "aggregations": {
        "filtered_except_parentPublicationType": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_parentPublicationTypes": {
              "terms": {
                "field": "parentPublicationType.id.keyword",
                "size": 100
              }
            }
          }
        }
      }
    }
  }
}

function additionsFromInternationalPublication(searchParams: SearchParams) {
  return {
    "all_data_except_internationalPublication": {
      "global": {},
      "aggregations": {
        "filtered_except_internationalPublication": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_internationalPublications": {
              "terms": {
                "field": "internationalPublication",
                "size": 100
              }
            }
          }
        }
      }
    }
  }
}

function additionsFromArticleTypeCode(searchParams: SearchParams) {
return {
    "all_data_except_articleTypeCode": {
      "global": {},
      "aggregations": {
        "filtered_except_articleTypeCode": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForJufoClassCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_articleTypeCodes": {
              "terms": {
                "field": "articleTypeCode",
                "size": 100
              }
            }
          }
        }
      }
    }
  }
}

function additionsFromJufoClassCode(searchParams: SearchParams) {
  return {
    "all_data_except_jufoClassCode": {
      "global": {},
      "aggregations": {
        "filtered_except_jufoClassCode": {
          "filter": {
            "bool": {
              "must": [
                matchingTerms(searchParams),
                ...termsForYear(searchParams),
                ...termsForTypeCode(searchParams),
                ...termsForStatusCode(searchParams),
                ...termsForOrganization(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_jufoClassCodes": {
              "terms": {
                "field": "jufoClassCode.keyword",
                "size": 100
              }
            }
          }
        }
      }
    }
  }
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
                ...termsForStatusCode(searchParams),
                ...termsForLanguageCode(searchParams),
                ...termsForPublicationFormat(searchParams),
                ...termsForPublicationAudience(searchParams),
                ...termsForPeerReviewed(searchParams),
                ...termsForParentPublicationType(searchParams),
                ...termsForInternationalPublication(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams)
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

function toIdNameLookup(data: OrgsAggsResponse): Map<string, string> {
  const pairs = getOrganizationNameBuckets(data).map((bucket) => [bucket.key.id, bucket.key.name]);

  return Object.fromEntries(pairs);
}

function getOrganizationNameBuckets(response: OrgsAggsResponse) {
  return response.aggregations.filtered_authors.single_sector.organizations.composite_orgs.buckets;
}

export function getOrganizationAdditions(aggregations: OrganizationAggregation) {
  return aggregations.all_data_except_organizationId?.filtered_except_organizationId.organization_nested.all_organizationIds.buckets ?? [];
}

export function getYearAdditions(aggregations: YearAggregation) {
  return aggregations.all_data_except_publicationYear?.filtered_except_publicationYear.all_publicationYears.buckets ?? [];
}

export function getLanguageCodeAdditions(aggregations: any) {
  return aggregations.all_data_except_languageCode?.filtered_except_languageCode.all_languageCodes.buckets ?? [];
}

export function getPublicationFormatAdditions(aggregations: any) {
  return aggregations.all_data_except_publicationFormat?.filtered_except_publicationFormat.all_publicationFormats.buckets ?? [];
}

export function getPublicationAudienceAdditions(aggregations: any) {
  return aggregations.all_data_except_publicationAudience?.filtered_except_publicationAudience.all_publicationAudiences.buckets ?? [];
}

export function getPeerReviewedAdditions(aggregations: any) {
  return aggregations.all_data_except_peerReviewed?.filtered_except_peerReviewed.all_peerReviewed.buckets ?? [];
}

export function getParentPublicationTypeAdditions(aggregations: any) {
  return aggregations.all_data_except_parentPublicationType?.filtered_except_parentPublicationType.all_parentPublicationTypes.buckets ?? [];
}

export function getInternationalPublicationAdditions(aggregations: any) {
  return aggregations.all_data_except_internationalPublication?.filtered_except_internationalPublication.all_internationalPublications.buckets ?? [];
}

export function getArticleTypeCodeAdditions(aggregations: any) {
  return aggregations.all_data_except_articleTypeCode?.filtered_except_articleTypeCode.all_articleTypeCodes.buckets ?? [];
}

export function getJufoClassCodeAdditions(aggregations: any) {
  return aggregations.all_data_except_jufoClassCode?.filtered_except_jufoClassCode.all_jufoClassCodes.buckets ?? [];
}
