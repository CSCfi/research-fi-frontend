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
  id: string;
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

  fieldsOfScience?: string[],
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
      sort: [
        "_score",
        { "publicationYear": { "order": "desc" } }
      ],
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
        ...additionsFromJufoClassCode(searchParams),
        ...additionsFromFieldsOfScience(searchParams),
        ...additionsFromPublicationTypeCode(searchParams),
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
      id: searchData._id,
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

  getFieldsOfScienceNames(): Observable<Record<string, string>> {
    const body = {
      "size": 0,
      "aggs": {
        "fieldsOfScience_nested": {
          "nested": {
            "path": "fieldsOfScience"
          },
          "aggs": {
            "composite_field_of_science": {
              "composite": {
                "size": 65536,
                "sources": [
                  {
                    "id": {
                      "terms": {
                        "field": "fieldsOfScience.fieldIdScience"
                      }
                    }
                  },
                  {
                    "name": {
                      "terms": {
                        "field": "fieldsOfScience.nameFiScience.keyword"                                                // TODO localized path needed
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    };

    type FieldsOfScienceAggregation = {
      aggregations: {
        fieldsOfScience_nested: {
          composite_field_of_science: {
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

    const response$ = this.http.post<FieldsOfScienceAggregation>('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', body);

    return response$.pipe(
      map((res) => res.aggregations.fieldsOfScience_nested.composite_field_of_science.buckets.map((bucket) => [bucket.key.id, bucket.key.name])),
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getPublicationTypeCodeNames(): Observable<Record<string, string>> {
    const labels = [
      { value: `A`,  name: $localize`@@publicationClassA:Vertaisarvioidut tieteelliset artikkelit` },
      { value: `A1`, name: $localize`@@publicationClassA1:Alkuperäisartikkeli tieteellisessä aikakauslehdessä` },
      { value: `A2`, name: $localize`@@publicationClassA2:Katsausartikkeli tieteellisessä aikakauslehdessä` },
      { value: `A3`, name: $localize`@@publicationClassA3:Kirjan tai muun kokoomateoksen osa` },
      { value: `A4`, name: $localize`@@publicationClassA4:Artikkeli konferenssijulkaisussa` },
      { value: `B`,  name: $localize`@@publicationClassB:Vertaisarvioimattomat tieteelliset kirjoitukset` },
      { value: `B1`, name: $localize`@@publicationClassB1:Kirjoitus tieteellisessä aikakausilehdessä` },
      { value: `B2`, name: $localize`@@publicationClassB2:Kirjan tai muun kokoomateoksen osa` },
      { value: `B3`, name: $localize`@@publicationClassB3:Vertaisarvioimaton artikkeli konferenssijulkaisussa` },
      { value: `C`,  name: $localize`@@publicationClassC:Tieteelliset kirjat` },
      { value: `C1`, name: $localize`@@publicationClassC1:Kustannettu tieteellinen erillisteos` },
      { value: `C2`, name: $localize`@@publicationClassC2:Toimitettu kirja, kokoomateos, konferenssijulkaisu tai lehden erikoisnumero` },
      { value: `D`,  name: $localize`@@publicationClassD:Ammattiyhteisölle suunnatut julkaisut` },
      { value: `D1`, name: $localize`@@publicationClassD1:Artikkeli ammattilehdessä` },
      { value: `D2`, name: $localize`@@publicationClassD2:Artikkeli ammatillisessa kokoomateoksessa` },
      { value: `D3`, name: $localize`@@publicationClassD3:Artikkeli ammatillisessa konferenssijulkaisussa` },
      { value: `D4`, name: $localize`@@publicationClassD4:Julkaistu kehittämis- tai tutkimusraportti taikka -selvitys` },
      { value: `D5`, name: $localize`@@publicationClassD5:Ammatillinen kirja` },
      { value: `D6`, name: $localize`@@publicationClassD6:Toimitettu ammatillinen teos` },
      { value: `E`,  name: $localize`@@publicationClassE:Suurelle yleisölle suunnatut julkaisut` },
      { value: `E1`, name: $localize`@@publicationClassE1:Yleistajuinen artikkeli, sanomalehtiartikkeli` },
      { value: `E2`, name: $localize`@@publicationClassE2:Yleistajuinen monografia` },
      { value: `E3`, name: $localize`@@publicationClassE3:Toimitettu yleistajuinen teos` },
      { value: `F`,  name: $localize`@@publicationClassF:Julkinen taiteellinen ja taideteollinen toiminta` },
      { value: `F1`, name: $localize`@@publicationClassF1:Itsenäinen teos tai esitys` },
      { value: `F2`, name: $localize`@@publicationClassF2:Taiteellisen teoksen tai esityksen osatoteutus` },
      { value: `F3`, name: $localize`@@publicationClassF3:Ei-taiteellisen julkaisun taiteellinen osa` },
      { value: `G`,  name: $localize`@@publicationClassG:Opinnäytteet ` },
      { value: `G1`, name: $localize`@@publicationClassG1:Ammattikorkeakoulututkinnon opinnäytetyö, kandidaatintyö` },
      { value: `G2`, name: $localize`@@publicationClassG2:Pro gradu, diplomityö, ylempi amk-opinnäytetyö` },
      { value: `G3`, name: $localize`@@publicationClassG3:Lisensiaatintyö` },
      { value: `G4`, name: $localize`@@publicationClassG4:Monografiaväitöskirja` },
      { value: `G5`, name: $localize`@@publicationClassG5:Artikkeliväitöskirja` },
      { value: `H`,  name: $localize`@@publicationClassH:Patentit ja keksintöilmoitukset` },
      { value: `H1`, name: $localize`@@publicationClassH1:Myönnetty patentti` },
      { value: `H2`, name: $localize`@@publicationClassH2:Keksintöilmoitus` },
      { value: `I`,  name: $localize`@@publicationClassI:Audiovisuaaliset julkaisut ja tieto- ja viestintätekniset sovellukset` },
      { value: `I1`, name: $localize`@@publicationClassI1:Audiovisuaaliset julkaisut` },
      { value: `I2`, name: $localize`@@publicationClassI2:Tieto- ja viestintätekniset sovellukset` }
    ];

    // Turn into key value object
    const lookup = labels.reduce((acc, label) => {
      acc[label.value] = label.name;
      return acc;
    });

    return of({
      ...lookup
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
              ]
            }
          },
          "aggregations": {
            "all_languageCodes": {
              "terms": {
                "field": "languages.languageCode.keyword",
                "size": 1000,
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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
                ...termsForArticleTypeCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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

function additionsFromFieldsOfScience(searchParams: SearchParams) {
  return {
    "all_data_except_fieldsOfScience": {
      "global": {},
      "aggregations": {
        "filtered_except_fieldsOfScience": {
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
                ...termsForArticleTypeCode(searchParams),
                ...termsForJufoClassCode(searchParams),
                ...termsForPublicationTypeCode(searchParams),
              ]
            }
          },
          "aggregations": {
            "fieldsOfScience_nested": {
              "nested": {
                "path": "fieldsOfScience"
              },
              "aggregations": {
                "all_fieldsOfScience": {
                  "terms": {
                    "field": "fieldsOfScience.fieldIdScience",
                    "size": 1000,
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

// NOTE: nested is needed for array type mapping
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

// NOTE: nested is needed for array type mapping
function termsForFieldsOfScience(searchParams: SearchParams) {
  if (searchParams.fieldsOfScience && searchParams.fieldsOfScience.length > 0) {
    return [{
      "nested": {
        "path": "fieldsOfScience",
        "query": {
          "bool": {
            "must": [
              {
                "terms": {
                  "fieldsOfScience.fieldIdScience": searchParams.fieldsOfScience
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

/*
GET publication/_search
{
 "query": {
   "match": {
     "publicationTypeCode": "A1"
   }
 }
}

GET publication/_search
{
  "size": 0,
  "aggs": {
    "publicationTypeCode": {
      "terms": {
        "field": "publicationTypeCode.keyword",
        "size": 100
      }
    }
  }
}
*/

function termsForPublicationTypeCode(searchParams: SearchParams) {
  if (searchParams.publicationTypeCode) {
    return [{
      terms: {
        "publicationTypeCode.keyword": searchParams.publicationTypeCode
      }
    }];
  }
  return [];
}

function additionsFromPublicationTypeCode(searchParams: SearchParams) {
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
                ...termsForJufoClassCode(searchParams),
                ...termsForArticleTypeCode(searchParams),
                ...termsForFieldsOfScience(searchParams)
              ]
            }
          },
          "aggregations": {
            "all_publicationTypeCodes": {
              "terms": {
                "field": "publicationTypeCode.keyword",
                "size": 100
              }
            }
          }
        }
      }
    }
  };
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
                ...termsForJufoClassCode(searchParams),
                ...termsForFieldsOfScience(searchParams),
                ...termsForPublicationTypeCode(searchParams),
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

// helper for getting all terms instead of using a array literal
function allMatchingTerms(searchParams: SearchParams) {
  return [
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
    ...termsForArticleTypeCode(searchParams),
    ...termsForJufoClassCode(searchParams),
    ...termsForFieldsOfScience(searchParams),
    // ...termsForPublicationTypeCode(searchParams) // TODO ENABLE
  ];
}

function allMatchingTermsExcept(excluded: string, searchParams: SearchParams) {
  return [
    matchingTerms(searchParams),
    ...(excluded === "year"                     ? [] : termsForYear(searchParams)),
    ...(excluded === "typeCode"                 ? [] : termsForTypeCode(searchParams)),
    ...(excluded === "statusCode"               ? [] : termsForStatusCode(searchParams)),
    ...(excluded === "organization"             ? [] : termsForOrganization(searchParams)),
    ...(excluded === "languageCode"             ? [] : termsForLanguageCode(searchParams)),
    ...(excluded === "publicationFormat"        ? [] : termsForPublicationFormat(searchParams)),
    ...(excluded === "publicationAudience"      ? [] : termsForPublicationAudience(searchParams)),
    ...(excluded === "peerReviewed"             ? [] : termsForPeerReviewed(searchParams)),
    ...(excluded === "parentPublicationType"    ? [] : termsForParentPublicationType(searchParams)),
    ...(excluded === "internationalPublication" ? [] : termsForInternationalPublication(searchParams)),
    ...(excluded === "articleTypeCode"          ? [] : termsForArticleTypeCode(searchParams)),
    ...(excluded === "jufoClassCode"            ? [] : termsForJufoClassCode(searchParams)),
    ...(excluded === "fieldsOfScience"          ? [] : termsForFieldsOfScience(searchParams)),
    // ...(excluded === "publicationTypeCode"   ? [] : termsForPublicationTypeCode(searchParams)), // TODO ENABLE
    ];
}

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

export function getPublisherInternationalityAdditions(aggregations: any) {
  // used to be called "getInternationalPublicationAdditions"

  // TODO rename all the way to with "PublisherInternationality"
  return aggregations.all_data_except_internationalPublication?.filtered_except_internationalPublication.all_internationalPublications.buckets ?? [];
}

export function getArticleTypeCodeAdditions(aggregations: any) {
  return aggregations.all_data_except_articleTypeCode?.filtered_except_articleTypeCode.all_articleTypeCodes.buckets ?? [];
}

export function getJufoClassCodeAdditions(aggregations: any) {
  return aggregations.all_data_except_jufoClassCode?.filtered_except_jufoClassCode.all_jufoClassCodes.buckets ?? [];
}

export function getFieldsOfScienceAdditions(aggregations: any) {
  return aggregations.all_data_except_fieldsOfScience?.filtered_except_fieldsOfScience.fieldsOfScience_nested.all_fieldsOfScience.buckets ?? [];
}

export function getPublicationTypeCodeAdditions(aggregations: any) {
  return aggregations.all_data_except_publicationTypeCode?.filtered_except_publicationTypeCode.all_publicationTypeCodes.buckets ?? [];
}
