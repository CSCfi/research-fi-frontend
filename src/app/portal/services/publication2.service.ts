import { inject, Injectable, LOCALE_ID, OnInit, SecurityContext } from '@angular/core';
// import { object, Output, parse, string } from 'valibot';
import { BehaviorSubject, forkJoin, Observable, of, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { locale } from "../../../environments/locale";
const path = suffixer(locale);

/*const PublicationSearchSchema = object({
  publicationId: string(),
  title: string(),
});*/

type TODO = any;
type PublicationSearch = TODO; // Output<typeof PublicationSearchSchema>;

// function that validates API response into a PublicationSearch
function parsePublicationSearch(data: TODO): PublicationSearch {
  return data;
  // return parse(PublicationSearchSchema, data);
}

// export interface HighlightedPublication {
export type HighlightedPublication = {
  id: string;
  publicationName: SafeHtml;
  authorsText: SafeHtml;
  authorsTextSplitted: SafeHtml;
  publisherName: SafeHtml;
  publicationYear: SafeHtml;

  badges: {
    doi?: string;
    peerReviewed?: boolean;
    openAccess?: string;
  };
}

type CachedPublicationSearch = {
  keywords: string,
  publicationSearch: PublicationSearch,
}

export type SearchParams = {
  q?: string[],
  page?: string[],
  size?: string[],
  sort?: string[],

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

  openAccess?: string[],
  publisherOpenAccessCode?: string[],
  selfArchivedCode?: string[],
}

@Injectable({
  providedIn: 'root'
})
export class Publication2Service {
  http = inject(HttpClient);
  sanitizer = inject(DomSanitizer);
  locale = inject(LOCALE_ID);

  searchUrl = 'https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?'

  searchParams = new BehaviorSubject<SearchParams>({});

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
    map<PublicationSearch[], HighlightedPublication[]>((publicationSearch: PublicationSearch) => this.createHighlightedPublications(publicationSearch))
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

  updateSearchTerms(searchParams: SearchParams): void {
    this.searchParams.next(searchParams);
  }

  private searchPublications(searchParams: SearchParams): Observable<unknown> {
    const q = searchParams.q?.[0] ?? "";
    const page = parseInt(searchParams.page?.[0] ?? "1");
    const size = parseInt(searchParams.size?.[0] ?? "10");
    const from = (page - 1) * size;

    // searchParams = searchParams as SearchParams; // TODO no effect?

    return this.http.post(this.searchUrl, {
      from: from,
      size: size,
      track_total_hits: true,
      sort: [
        // "_score",
        // { "publicationYear": { "order": "desc" } }
        ...sortingTerms(searchParams)
      ],
      query: {
        bool: {
          must: {
            ...matchingTerms(searchParams)
          },
          filter: {
            bool: {
              must: [
                ...filteringTerms(searchParams),
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
        ...aggregationTerms(searchParams),
      }
    });
  }

  // sort column?
  // sort=foo OR fooDesc

  createHighlightedPublications(searchData: PublicationSearch): HighlightedPublication[] {
    return searchData.hits.hits.map((hit: any/*ES doc for Publication*/) => this.createHighlightedPublication(hit));
  }

  createHighlightedPublication(searchData: any/*ES doc for Publication*/): HighlightedPublication {
    const source = searchData._source;
    const highlight = searchData.highlight;

    /*const badgesExist = {
      doi: source.doi != null || source.doiHandle != null,
      peerReviewed: source.peerReviewed?.id === 1 ?? false,
      openAccess: source.openAccess === 1
    }*/

    // badges are keys values with strings to strings


    const badges: {
      doi?: string;
      peerReviewed?: boolean;
      openAccess?: string;
    } = {};

    badges.doi = source.doi;
    badges.openAccess = source.doiHandle;
    badges.peerReviewed = source.peerReviewed[0].id === "1";

    const publicationName = highlight?.publicationName?.[0] ?? source.publicationName ?? '';
    const authorsText = highlight?.authorsText?.[0] ?? source.authorsText ?? '';
    const authorsTextSplitted = highlight?.authorsText?.[0] ?? source.authorsText ?? '';
    const publisherName = highlight?.publisherName?.[0] ?? source.publisherName ?? '';
    const publicationYear = highlight?.publicationYear?.[0] ?? source.publicationYear ?? '';

    return {
      id: searchData._id,
      publicationName: this.sanitizer.sanitize(SecurityContext.HTML, publicationName),
      authorsText: this.sanitizer.sanitize(SecurityContext.HTML, authorsText),
      authorsTextSplitted: this.sanitizer.sanitize(SecurityContext.HTML, authorsTextSplitted),
      publisherName: this.sanitizer.sanitize(SecurityContext.HTML, publisherName),
      publicationYear: this.sanitizer.sanitize(SecurityContext.HTML, publicationYear),

      badges: badges
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
                          { 'name': { 'terms': { 'field': path`author.organization.OrganizationNameFi.keyword` } } }        // TODO path template needed
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
      return this.http.post<OrgsAggsResponse>(this.searchUrl, organizationNamesBySector(sectorId)).pipe(
        map((res) => getOrganizationNameBuckets(res).map((bucket) => [bucket.key.id, {name: bucket.key.name, sectorId}])),
      );
    });

    return forkJoin(responses$)
      .pipe(map(responses => responses.flat()))
      .pipe(map(pairs => Object.fromEntries(pairs)))
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getLanguageCodeNames(): Observable<Record<string, string>> {
    const body = {
      'size': 0,
      'aggs': {
        'composite_pairs': {
          'composite': {
            'size': 1000,
            'sources': [
              { 'id': { 'terms': { 'field': 'languages.languageCode.keyword' } } },
              { 'nameFiLanguage': { 'terms': { 'field': path`languages.languageFi.keyword` } } }                        // TODO: does the key need to be localized? // TODO remove "fi" ?
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

    const response$ = this.http.post<LanguageAggregation>(this.searchUrl, body);

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
              { 'nameFiFormat': { 'terms': { 'field': path`publicationFormat.nameFiPublicationFormat.keyword` } } }  // TODO Does the key need to be localized? // TODO remove "fi" ?
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

    const response$ = this.http.post<PublicationFormatAggregation>(this.searchUrl, body);

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
              { 'nameFiAudience': { 'terms': { 'field': path`publicationAudience.nameFiPublicationAudience.keyword` } } } // TODO Does the key need to be localized? // TODO remove "fi" ?
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

    const response$ = this.http.post<PublicationAudienceAggregation>(this.searchUrl, body);

    return response$.pipe(
      map((res) => res.aggregations.composite_pairs.buckets.map((bucket) => [bucket.key.id, bucket.key.nameFiAudience])),  // TODO localized path needed
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getParentPublicationTypeNames(): Observable<Record<string, string>> {
    const body = {
      "size": 0,
      "aggs": {
        "composite_pairs": {
          "composite": {
            "size": 1000,
            "sources": [
              { "id": { "terms": { "field": "parentPublicationType.id.keyword" } } },
                { "nameFiParentPublicationType": { "terms": { "field": path`parentPublicationType.nameFiParentPublicationType.keyword` } } } // TODO Does the key need to be localized? // TODO remove "fi" ?
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

    const response$ = this.http.post<ParentPublicationTypeAggregation>(this.searchUrl, body);

    return response$.pipe(
      map((res) => res.aggregations.composite_pairs.buckets.map((bucket) => [bucket.key.id, bucket.key.nameFiParentPublicationType])),  // TODO localized path needed
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getPeerReviewedNames(): Observable<Record<string, string>> {
    return of({
      "0": $localize`:@@notPeerReviewed:Ei-vertaisarvioitu`,  // TODO does not exist in localization file
      "1": $localize`:@@peerReviewed:Vertaisarvioitu`
    });
  }

  getInternationalPublicationNames(): Observable<Record<string, string>> {
    return of({
      "0": $localize`:@@domesticPublication:Kotimainen julkaisu`,
      "1": $localize`:@@internationalPublication:Kansainvälinen julkaisu`
    });
  }

  getArticleTypeCodeNames(): Observable<Record<string, string>> {
    return of({
      "0": $localize`:@@journal:Lehti`,
      "1": $localize`:@@researchBook:Kokoomateos`,
      "2": $localize`:@@Conference:Konferenssi`,
      "3": $localize`:@@onlinePlatform:Verkkoalusta`
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
                        'field': path`fieldsOfScience.nameFiScience.keyword`                                                // TODO localized path needed
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

    const response$ = this.http.post<FieldsOfScienceAggregation>(this.searchUrl, body);

    return response$.pipe(
      map((res) => res.aggregations.fieldsOfScience_nested.composite_field_of_science.buckets.map((bucket) => [bucket.key.id, bucket.key.name])),
      map(pairs => Object.fromEntries(pairs)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getPublicationTypeCodeNames(): Observable<Record<string, string>> {
    const labels = [
      { value: `A`,  name: $localize`:@@publicationClassA:Vertaisarvioidut tieteelliset artikkelit` },
      { value: `A1`, name: $localize`:@@publicationClassA1:Alkuperäisartikkeli tieteellisessä aikakauslehdessä` },
      { value: `A2`, name: $localize`:@@publicationClassA2:Katsausartikkeli tieteellisessä aikakauslehdessä` },
      { value: `A3`, name: $localize`:@@publicationClassA3:Kirjan tai muun kokoomateoksen osa` },
      { value: `A4`, name: $localize`:@@publicationClassA4:Artikkeli konferenssijulkaisussa` },
      { value: `B`,  name: $localize`:@@publicationClassB:Vertaisarvioimattomat tieteelliset kirjoitukset` },
      { value: `B1`, name: $localize`:@@publicationClassB1:Kirjoitus tieteellisessä aikakausilehdessä` },
      { value: `B2`, name: $localize`:@@publicationClassB2:Kirjan tai muun kokoomateoksen osa` },
      { value: `B3`, name: $localize`:@@publicationClassB3:Vertaisarvioimaton artikkeli konferenssijulkaisussa` },
      { value: `C`,  name: $localize`:@@publicationClassC:Tieteelliset kirjat` },
      { value: `C1`, name: $localize`:@@publicationClassC1:Kustannettu tieteellinen erillisteos` },
      { value: `C2`, name: $localize`:@@publicationClassC2:Toimitettu kirja, kokoomateos, konferenssijulkaisu tai lehden erikoisnumero` },
      { value: `D`,  name: $localize`:@@publicationClassD:Ammattiyhteisölle suunnatut julkaisut` },
      { value: `D1`, name: $localize`:@@publicationClassD1:Artikkeli ammattilehdessä` },
      { value: `D2`, name: $localize`:@@publicationClassD2:Artikkeli ammatillisessa kokoomateoksessa` },
      { value: `D3`, name: $localize`:@@publicationClassD3:Artikkeli ammatillisessa konferenssijulkaisussa` },
      { value: `D4`, name: $localize`:@@publicationClassD4:Julkaistu kehittämis- tai tutkimusraportti taikka -selvitys` },
      { value: `D5`, name: $localize`:@@publicationClassD5:Ammatillinen kirja` },
      { value: `D6`, name: $localize`:@@publicationClassD6:Toimitettu ammatillinen teos` },
      { value: `E`,  name: $localize`:@@publicationClassE:Suurelle yleisölle suunnatut julkaisut` },
      { value: `E1`, name: $localize`:@@publicationClassE1:Yleistajuinen artikkeli, sanomalehtiartikkeli` },
      { value: `E2`, name: $localize`:@@publicationClassE2:Yleistajuinen monografia` },
      { value: `E3`, name: $localize`:@@publicationClassE3:Toimitettu yleistajuinen teos` },
      { value: `F`,  name: $localize`:@@publicationClassF:Julkinen taiteellinen ja taideteollinen toiminta` },
      { value: `F1`, name: $localize`:@@publicationClassF1:Itsenäinen teos tai esitys` },
      { value: `F2`, name: $localize`:@@publicationClassF2:Taiteellisen teoksen tai esityksen osatoteutus` },
      { value: `F3`, name: $localize`:@@publicationClassF3:Ei-taiteellisen julkaisun taiteellinen osa` },
      { value: `G`,  name: $localize`:@@publicationClassG:Opinnäytteet` },
      { value: `G1`, name: $localize`:@@publicationClassG1:Ammattikorkeakoulututkinnon opinnäytetyö, kandidaatintyö` },
      { value: `G2`, name: $localize`:@@publicationClassG2:Pro gradu, diplomityö, ylempi amk-opinnäytetyö` },
      { value: `G3`, name: $localize`:@@publicationClassG3:Lisensiaatintyö` },
      { value: `G4`, name: $localize`:@@publicationClassG4:Monografiaväitöskirja` },
      { value: `G5`, name: $localize`:@@publicationClassG5:Artikkeliväitöskirja` },
      { value: `H`,  name: $localize`:@@publicationClassH:Patentit ja keksintöilmoitukset` },
      { value: `H1`, name: $localize`:@@publicationClassH1:Myönnetty patentti` },
      { value: `H2`, name: $localize`:@@publicationClassH2:Keksintöilmoitus` },
      { value: `I`,  name: $localize`:@@publicationClassI:Audiovisuaaliset julkaisut ja tieto- ja viestintätekniset sovellukset` },
      { value: `I1`, name: $localize`:@@publicationClassI1:Audiovisuaaliset julkaisut` },
      { value: `I2`, name: $localize`:@@publicationClassI2:Tieto- ja viestintätekniset sovellukset` }
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

  getOpenAccessNames(): Observable<Record<string, string>> {
    return of({
      "0": $localize`:@@publication2.openAccess.No:Ei avoin`,
      "1": $localize`:@@publication2.openAccess.Yes:Avoimesti saatavilla`,
      "9": $localize`:@@publication2.openAccess.Unknown:Ei tietoa`
    });
  }

  getPublisherOpenAccessNames(): Observable<Record<string, string>> {
    return of({
      "1": $localize`:@@publication2.publisherOpenAccess.fullyOpen:Kokonaan avoin julkaisukanava`,
      "2": $localize`:@@publication2.publisherOpenAccess.partiallyOpen:Osittain avoin julkaisukanava`,
      "3": $localize`:@@publication2.publisherOpenAccess.delayedOpen:Viivästetysti avoin julkaisukanava`,
      "0": $localize`:@@publication2.publisherOpenAccess.Unspecified:Ei vastausta`,
      // "9": $localize`:@@publication2.publisherOpenAccess.Unknown:Ei tietoa`
    });
  }

  getSelfArchivedCodeNames(): Observable<Record<string, string>> {
    return of({
      "1": $localize`:@@publication2.selfArchived.Yes:Rinnakkaistallennettu`,
      "0": $localize`:@@publication2.selfArchived.No:Ei rinnakkaistallennettu`,
      " ": $localize`:@@publication2.selfArchived.Unknown:Ei tietoa`
    });

  }
}

function escapeLastQuoteIfOdd(inputString: string): string {
  // Count the number of quotation marks in the string
  const quoteCount = (inputString.match(/"/g) || []).length;

  // If the count is odd, escape the last quotation mark
  if (quoteCount % 2 !== 0) {
    const lastQuoteIndex = inputString.lastIndexOf('"');
    // Replace the last quotation mark with an escaped version
    inputString = inputString.substring(0, lastQuoteIndex) + '\\"' + inputString.substring(lastQuoteIndex + 1);
  }

  return inputString;
}

function matchingTerms(searchParams: SearchParams) {
  let q = (searchParams.q ?? [""])[0];
  q = escapeLastQuoteIfOdd(q);

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

function generateAggregationStep(name: SearchParamKey, lookup: Record<string, {fieldName: string, fieldPath: string}>) {
  const fieldPath = lookup[name].fieldPath;

  const fieldName = lookup[name].fieldName;                                     // TODO: "fieldName" is just redundant
  const topLevelPath = `top_level_${fieldName}`;                                // TODO: Use the established SearchParamKey and arbitary fieldPath
  const middleLevelPath = `filtered_except_${fieldName}`;                       //
  const bottomLevelPath = `all_${fieldName}`;                                   //

  function getAdditions(searchParams: SearchParams) {
    const global = searchParams[name] != null

    if (global) {
      // console.log("global", name);

      return {
        [topLevelPath]: {
          global: {},
          aggregations: {
            [middleLevelPath]: {
              filter: {
                bool: {
                  must: [
                    ...additionFilterTerms(name, searchParams)
                  ]
                }
              },
              aggregations: {
                [bottomLevelPath]: {
                  terms: {
                    field: fieldPath,
                    size: 100
                  }
                }
              }
            }
          }
        }
      };
    } else {
      // console.log("local", name);

      return {
        [topLevelPath]: {
          filter: {
            bool: {
              must: [
                ...additionFilterTerms(name, searchParams)
              ]
            }
          },
          aggregations: {
            [bottomLevelPath]: {
              terms: {
                field: fieldPath,
                size: 100
              }
            }
          }
        }
      };
    }
  }

  function getBuckets(aggregations: any) {
    if (aggregations == null) {
      return [];
    }

    if (aggregations[topLevelPath]?.[middleLevelPath]?.[bottomLevelPath]?.buckets) {
      return aggregations[topLevelPath][middleLevelPath][bottomLevelPath].buckets;
    }
    else if (aggregations[topLevelPath]?.[bottomLevelPath]?.buckets) {
      return aggregations[topLevelPath][bottomLevelPath].buckets;
    } else {
      return [];
    }
  }

  return [getAdditions, getBuckets];
}

type SearchParamKey = Exclude<keyof SearchParams, "q" | "page" | "size" | "sort" | "sortName" | "sortDirection">;

const lookup: Record<SearchParamKey, {fieldName: string, fieldPath: string}> = {
  year:                    {fieldName: "publicationYear",          fieldPath: "publicationYear"},
  language:                {fieldName: "languages",                fieldPath: "languages.languageCode.keyword"},
  format:                  {fieldName: "publicationFormat",        fieldPath: "publicationFormat.id.keyword"},
  audience:                {fieldName: "publicationAudience",      fieldPath: "publicationAudience.id.keyword"},
  peerReviewed:            {fieldName: "peerReviewed",             fieldPath: "peerReviewed.id.keyword"},
  parentPublicationType:   {fieldName: "parentPublicationType",    fieldPath: "parentPublicationType.id.keyword"},
  international:           {fieldName: "internationalPublication", fieldPath: "internationalPublication"},
  articleType:             {fieldName: "articleTypeCode",          fieldPath: "articleTypeCode"},
  jufo:                    {fieldName: "jufoClassCode",            fieldPath: "jufoClassCode.keyword"},
  publicationTypeCode:     {fieldName: "publicationTypeCode",      fieldPath: "publicationTypeCode.keyword"},
  publicationStatusCode:   {fieldName: "publicationStatusCode",    fieldPath: "publicationStatusCode.keyword"},
  fieldsOfScience:         {fieldName: "fieldsOfScience",          fieldPath: "fieldsOfScience.fieldIdScience"},
  openAccess:              {fieldName: "openAccess",               fieldPath: "openAccess"},
  publisherOpenAccessCode: {fieldName: "publisherOpenAccessCode",  fieldPath: "publisherOpenAccessCode"},
  selfArchivedCode:        {fieldName: "selfArchivedCode",         fieldPath: "selfArchivedCode.keyword"},
  organization:            {fieldName: "organization",             fieldPath: "author.organization.organizationId.keyword"},
}

const [additionsFromYear, getYearAdditions] = generateAggregationStep("year", lookup);
export { getYearAdditions };

const [additionsFromLanguageCode, getLanguageCodeAdditions] = generateAggregationStep("language", lookup);
export { getLanguageCodeAdditions };

const [additionsFromPublicationFormat, getPublicationFormatAdditions] = generateAggregationStep("format", lookup);
export { getPublicationFormatAdditions };

const [additionsFromPublicationAudience, getPublicationAudienceAdditions] = generateAggregationStep("audience", lookup);
export { getPublicationAudienceAdditions };

const [additionsFromPeerReviewed, getPeerReviewedAdditions] = generateAggregationStep("peerReviewed", lookup);
export { getPeerReviewedAdditions };

const [additionsFromParentPublicationType, getParentPublicationTypeAdditions] = generateAggregationStep("parentPublicationType", lookup);
export { getParentPublicationTypeAdditions };

const [additionsFromInternationalPublication, getPublisherInternationalityAdditions] = generateAggregationStep("international", lookup);
export { getPublisherInternationalityAdditions };

const [additionsFromArticleTypeCode, getArticleTypeCodeAdditions] = generateAggregationStep("articleType", lookup);
export { getArticleTypeCodeAdditions };

const [additionsFromJufoClassCode, getJufoClassCodeAdditions] = generateAggregationStep("jufo", lookup);
export { getJufoClassCodeAdditions };

function suffixer(locale) {
  const capitalized = locale.charAt(0).toUpperCase() + locale.slice(1).toLowerCase();
  return strings => strings[0].replace(/(Fi|Sv|En)(?=[\.A-Z]|$)/g, capitalized);
}

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

function termsForOpenAccess(searchParams: SearchParams) {
  if (searchParams.openAccess) {
    return [{
      terms: {
        "openAccess": searchParams.openAccess
      }
    }];
  }
  return [];
}

const [additionsFromOpenAccess, getOpenAccessAdditions] = generateAggregationStep("openAccess", lookup);
export { getOpenAccessAdditions };

function termsForPublisherOpenAccessCode(searchParams: SearchParams) {
  if (searchParams.publisherOpenAccessCode) {
    return [{
      terms: {
        "publisherOpenAccessCode": searchParams.publisherOpenAccessCode
      }
    }];
  }
  return [];
}

const [additionsFromPublisherOpenAccessCode, getPublisherOpenAccessCodeAdditions] = generateAggregationStep("publisherOpenAccessCode", lookup);
export { getPublisherOpenAccessCodeAdditions };

function termsForSelfArchivedCode(searchParams: SearchParams) {
  if (searchParams.selfArchivedCode) {
    return [{
      terms: {
        "selfArchivedCode.keyword": searchParams.selfArchivedCode
      }
    }];
  }
  return [];
}

const [additionsFromSelfArchivedCode, getSelfArchivedCodeAdditions] = generateAggregationStep("selfArchivedCode", lookup);
export { getSelfArchivedCodeAdditions };

const [additionsFromPublicationTypeCode, getPublicationTypeCodeAdditions] = generateAggregationStep("publicationTypeCode", lookup);
export { getPublicationTypeCodeAdditions };

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

function filteringTerms(searchParams: SearchParams) {
  return [
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
    ...termsForOpenAccess(searchParams),
    ...termsForPublisherOpenAccessCode(searchParams),
    ...termsForSelfArchivedCode(searchParams),
  ];
}

function aggregationTerms(searchParams: SearchParams) {
  return {
    ...additionsFromYear(searchParams),
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
    ...additionsFromOpenAccess(searchParams),
    ...additionsFromPublisherOpenAccessCode(searchParams),
    ...additionsFromSelfArchivedCode(searchParams),
  };
}

function additionFilterTerms(excluded: SearchParamKey, searchParams: SearchParams) {
  return [
    matchingTerms(searchParams),
    ...(excluded === "year"                    ? [] : termsForYear(searchParams)),
    ...(excluded === "publicationStatusCode"   ? [] : termsForStatusCode(searchParams)),
    ...(excluded === "organization"            ? [] : termsForOrganization(searchParams)),
    ...(excluded === "language"                ? [] : termsForLanguageCode(searchParams)),
    ...(excluded === "format"                  ? [] : termsForPublicationFormat(searchParams)),
    ...(excluded === "audience"                ? [] : termsForPublicationAudience(searchParams)),
    ...(excluded === "peerReviewed"            ? [] : termsForPeerReviewed(searchParams)),
    ...(excluded === "parentPublicationType"   ? [] : termsForParentPublicationType(searchParams)),
    ...(excluded === "international"           ? [] : termsForInternationalPublication(searchParams)),
    ...(excluded === "articleType"             ? [] : termsForArticleTypeCode(searchParams)),
    ...(excluded === "jufo"                    ? [] : termsForJufoClassCode(searchParams)),
    ...(excluded === "fieldsOfScience"         ? [] : termsForFieldsOfScience(searchParams)),
    ...(excluded === "publicationTypeCode"     ? [] : termsForPublicationTypeCode(searchParams)),
    ...(excluded === "openAccess"              ? [] : termsForOpenAccess(searchParams)),
    ...(excluded === "publisherOpenAccessCode" ? [] : termsForPublisherOpenAccessCode(searchParams)),
    ...(excluded === "selfArchivedCode"        ? [] : termsForSelfArchivedCode(searchParams)),
  ];
}

function sortingTerms(searchParams: SearchParams) {
  let sortedField = "publicationYear";
  let direction = "desc";

  const textFields = ["publicationName", "authorsText", "publisherName"];

  if (searchParams.sort != null) {
    const value = searchParams.sort.pop();

    sortedField = value.replace(/Desc$/, "");
    direction = value.endsWith("Desc") ? "desc" : "asc";

    if (textFields.includes(sortedField)) {
      sortedField += ".keyword";
    }
  }

  return [
    { [sortedField]: { "order": direction } },
    "_score"
  ];
}

function getOrganizationNameBuckets(response: OrgsAggsResponse) {
  return response.aggregations.filtered_authors.single_sector.organizations.composite_orgs.buckets;
}

function additionsFromOrganization(searchParams: SearchParams, global = false) {
  if (global)
    return {
      "all_data_except_organizationId": {
        "global": {},
        "aggregations": {
          "filtered_except_organizationId": {
            "filter": {
              "bool": {
                "must": [
                  ...additionFilterTerms("organization", searchParams),
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

  else
    return {
      "all_data_except_organizationId": {
        "filter": {
          "bool": {
            "must": [
              ...additionFilterTerms("organization", searchParams),
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
    };
}

export function getOrganizationAdditions(aggregations: /*OrganizationAggregation*/ any, global = false) {
  if (global)
    return aggregations.all_data_except_organizationId?.filtered_except_organizationId.organization_nested.all_organizationIds.buckets ?? [];
  else
    return aggregations.all_data_except_organizationId.organization_nested.all_organizationIds.buckets ?? [];
}

function additionsFromFieldsOfScience(searchParams: SearchParams, global = false) {
  if (global)
    return {
      "all_data_except_fieldsOfScience": {
        "global": {},
        "aggregations": {
          "filtered_except_fieldsOfScience": {
            "filter": {
              "bool": {
                "must": [
                  ...additionFilterTerms("fieldsOfScience", searchParams),
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

  else
    return {
      "all_data_except_fieldsOfScience": {
        "filter": {
          "bool": {
            "must": [
              ...additionFilterTerms("fieldsOfScience", searchParams),
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
    };
}

export function getFieldsOfScienceAdditions(aggregations: any, global = false) {
  if (global)
    return aggregations.all_data_except_fieldsOfScience?.filtered_except_fieldsOfScience.fieldsOfScience_nested.all_fieldsOfScience.buckets ?? [];
  else
    return aggregations.all_data_except_fieldsOfScience.fieldsOfScience_nested.all_fieldsOfScience.buckets ?? [];
}
