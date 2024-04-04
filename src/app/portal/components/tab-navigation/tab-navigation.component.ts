import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabButtonComponent } from '@portal/components/tab-button/tab-button.component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SearchService } from '@portal/services/search.service';
import { ActivatedRoute } from '@angular/router';

type IndexCounts = { [index: string]: number };
type ButtonData = { label: string, icon: string, route: string, count: number };

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [CommonModule, TabButtonComponent],
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss']
})
export class TabNavigationComponent {
  // @Input() state

  http = inject(HttpClient);
  breakpointObserver = inject(BreakpointObserver);
  appConfigService = inject(AppConfigService);

  url = this.appConfigService.apiUrl + "publication,person,funding,dataset,funding-call,infrastructure,organization/_search?request_cache=true";

  showAll$ = new BehaviorSubject(false);

  // Legacy compatibility
  searchService = inject(SearchService);
  route = inject(ActivatedRoute);

  fullCounts$: Observable<IndexCounts> = this.http.post(this.url, payloadWithoutKeywords()).pipe(
    map((response: any) => response.aggregations),
    map(aggregations => Object.entries(aggregations._index.buckets)),
    map(buckets => buckets.reduce((acc, [key, value]) => ({ ...acc, [key]: (value as any).doc_count }), {}))
  );

  input$ = this.route.params.pipe(map(params => params["input"]));

  partialCounts$ = this.input$.pipe(
    switchMap(input => this.http.post(this.url, payloadWithKeywords(input)).pipe(
      map((response: any) => response.aggregations),
      map(aggregations => Object.entries(aggregations._index.buckets)),
      map(buckets => buckets.reduce((acc, [key, value]) => ({ ...acc, [key]: (value as any).doc_count }), {}))
    )),
  );

  counts$ = this.route.params.pipe(
    map(params => params["tab"] && params["input"]),
    switchMap(isPartial => isPartial ? this.partialCounts$ : this.fullCounts$)
  );

  defaultOrderButtons$: Observable<ButtonData[]> = this.counts$.pipe(
    map(counts => [
      { label: 'Publications',    icon: 'faFileLines',  route: "/results/publications",    count: counts.publications },
      { label: 'Persons',         icon: 'faUsers',      route: "/results/persons",         count: counts.persons },
      { label: 'Fundings',        icon: 'faBriefcase',  route: "/results/fundings",        count: counts.fundings },
      { label: 'Datasets',        icon: 'faFileAlt',    route: "/results/datasets",        count: counts.datasets },
      { label: 'Funding Calls',   icon: 'faBullhorn',   route: "/results/funding-calls",   count: counts.fundingCalls },
      { label: 'Infrastructures', icon: 'faUniversity', route: "/results/infrastructures", count: counts.infrastructures },
      { label: 'Organizations',   icon: 'faCalculator', route: "/results/organizations",   count: counts.organizations },
    ])
  );

  sortedButtons$: Observable<ButtonData[]> = this.defaultOrderButtons$.pipe(
    map(buttons => buttons.sort((a, b) => b.count - a.count))
  );

  responsiveOrder$: Observable<ButtonData[]> = this.breakpointObserver.observe(['(max-width: 768px)']).pipe(
    switchMap(result => result.matches ? this.sortedButtons$ : this.defaultOrderButtons$)
  );

  responsiveSize$: Observable<number> = this.breakpointObserver.observe(['(min-width: 1200px)', '(min-width: 990px)', '(min-width: 768px)']).pipe(
    map(result => {
      if (result.breakpoints['(min-width: 1200px)']) {
        return 8;
      } else if (result.breakpoints['(min-width: 990px)']) {
        return 3;
      } else if (result.breakpoints['(min-width: 768px)']) {
        return 3;
      } else {
        return 3;
      }
    })
  );

  end$ = combineLatest([this.showAll$, this.responsiveSize$, this.defaultOrderButtons$]).pipe(
    map<[boolean, number, ButtonData[]], number>(([showAll, end, buttons]) => showAll ? buttons.length : end)
  );

  isDesktop$ = this.breakpointObserver.observe(['(min-width: 1200px)']).pipe(
    map(result => result.matches)
  );

  toggleAll() {
    this.showAll$.next(!this.showAll$.value);
  }

  trackByLabel(index: number, button: ButtonData) {
    return button.label;
  }
}

function payloadWithoutKeywords() {
  return {
    "size": 0,
    "aggs": {
      "_index": {
        "filters": {
          "filters": {
            "publications": {
              "match": {
                "_index": "publication"
              }
            },
            "persons": {
              "match": {
                "_index": "person"
              }
            },
            "fundings": {
              "match": {
                "_index": "funding"
              }
            },
            "datasets": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "_index": "dataset"
                    }
                  },
                  {
                    "term": {
                      "isLatestVersion": 1
                    }
                  }
                ]
              }
            },
            "infrastructures": {
              "match": {
                "_index": "infrastructure"
              }
            },
            "organizations": {
              "match": {
                "_index": "organization"
              }
            },
            "fundingCalls": {
              "match": {
                "_index": "funding-call"
              }
            }
          }
        }
      }
    }
  }
}

function payloadWithKeywords(keywords: string) {
  return {
    "query": {
      "bool": {
        "should": [
          {
            "bool": {
              "must": [
                {
                  "term": {
                    "_index": "publication"
                  }
                },
                {
                  "bool": {
                    "should": [
                      {
                        "match": {
                          "publicationName": {
                            "query": keywords,
                            "boost": 2
                          }
                        }
                      },
                      {
                        "match": {
                          "authorsTextSplitted": {
                            "query": keywords,
                            "operator": "and",
                            "boost": 1.25
                          }
                        }
                      },
                      {
                        "bool": {
                          "should": {
                            "nested": {
                              "path": "author",
                              "query": {
                                "multi_match": {
                                  "query": keywords,
                                  "type": "cross_fields",
                                  "fields": [
                                    "author.nameFiSector",
                                    "author.organization.OrganizationNameFi",
                                    "author.organization.OrganizationNameEn",
                                    "author.organization.OrganizationNameSv",
                                    "author.organization.organizationUnit.organizationUnitNameFi",
                                    "author.organization.organizationUnit.organizationUnitNameEn",
                                    "author.organization.organizationUnit.organizationUnitNameSv",
                                    "author.organization.organizationUnit.person.authorFirstNames",
                                    "author.organization.organizationUnit.person.authorLastName",
                                    "author.organization.organizationUnit.person.Orcid"
                                  ],
                                  "operator": "AND",
                                  "lenient": "true"
                                }
                              }
                            }
                          },
                          "boost": 0.4
                        }
                      },
                      {
                        "match": {
                          "keywords.keyword": {
                            "query": keywords
                          }
                        }
                      },
                      {
                        "match": {
                          "jufoCode": {
                            "query": keywords
                          }
                        }
                      },
                      {
                        "match_phrase_prefix": {
                          "journalName": {
                            "query": keywords
                          }
                        }
                      },
                      {
                        "match_phrase": {
                          "isbn": {
                            "query": keywords,
                            "boost": 2
                          }
                        }
                      },
                      {
                        "match_phrase": {
                          "issn": {
                            "query": keywords,
                            "boost": 2
                          }
                        }
                      },
                      {
                        "match_phrase": {
                          "parentPublicationName": {
                            "query": keywords,
                            "boost": 2
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "bool": {
              "must": [
                {
                  "term": {
                    "_index": "person"
                  }
                },
                {
                  "bool": {
                    "should": [
                      {
                        "multi_match": {
                          "query": keywords,
                          "analyzer": "standard",
                          "type": "phrase_prefix",
                          "fields": [
                            "id",
                            "personal.names.firstNames",
                            "personal.names.lastName",
                            "personal.otherNames.firstNames",
                            "personal.otherNames.lastName",
                            "personal.otherNames.fullName",
                            "personal.keywords.value",
                            "personal.researcherDescriptions.researchDescriptionFi",
                            "personal.researcherDescriptions.researchDescriptionSv",
                            "personal.researcherDescriptions.researchDescriptionEn",
                            "personal.fieldOfSciences"
                          ],
                          "operator": "AND",
                          "lenient": "true",
                          "max_expansions": 1024
                        }
                      },
                      {
                        "multi_match": {
                          "query": keywords,
                          "type": "cross_fields",
                          "fields": [
                            "id",
                            "personal.names.firstNames",
                            "personal.names.lastName",
                            "personal.otherNames.firstNames",
                            "personal.otherNames.lastName",
                            "personal.otherNames.fullName",
                            "personal.keywords.value",
                            "personal.researcherDescriptions.researchDescriptionFi",
                            "personal.researcherDescriptions.researchDescriptionSv",
                            "personal.researcherDescriptions.researchDescriptionEn",
                            "personal.fieldOfSciences"
                          ],
                          "operator": "AND",
                          "lenient": "true"
                        }
                      },
                      {
                        "nested": {
                          "path": "activity.affiliations",
                          "query": {
                            "bool": {
                              "should": [
                                {
                                  "multi_match": {
                                    "query": keywords,
                                    "type": "best_fields",
                                    "operator": "OR",
                                    "fields": [
                                      "activity.affiliations.organizationNameFi",
                                      "activity.affiliations.organizationNameSv",
                                      "activity.affiliations.organizationNameEn",
                                      "activity.educations.nameFi",
                                      "activity.educations.nameSv",
                                      "activity.educations.nameEn",
                                      "activity.affiliations.positionNameFi",
                                      "activity.affiliations.positionNameSv",
                                      "activity.affiliations.positionNameEn"
                                    ],
                                    "lenient": "true"
                                  }
                                }
                              ]
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "bool": {
              "must": [
                {
                  "term": {
                    "_index": "funding"
                  }
                },
                {
                  "bool": {
                    "should": [
                      {
                        "multi_match": {
                          "query": keywords,
                          "analyzer": "standard",
                          "type": "phrase_prefix",
                          "fields": [
                            "projectNameFi^2",
                            "projectNameEn^2",
                            "projectNameSv^2",
                            "projectAcronym",
                            "projectDescriptionFi",
                            "projectDescriptionEn",
                            "projectDescriptionSv",
                            "fundingStartYear",
                            "fundingContactPersonLastName",
                            "fundingContactPersonFirstNames",
                            "funderNameFi",
                            "funderNameEn",
                            "funderNameSv",
                            "funderNameUnd",
                            "typeOfFundingId",
                            "typeOfFundingNameFi",
                            "typeOfFundingNameEn",
                            "typeOfFundingNameSv",
                            "callProgrammeNameFi",
                            "callProgrammeNameEn",
                            "callProgrammeNameSv",
                            "callProgrammeHomepage",
                            "callProgrammeUnd",
                            "funderProjectNumber",
                            "relatedFunding.funderProjectNumber",
                            "keywords.keyword",
                            "keyword.scheme",
                            "fundedNameFi",
                            "funderNameFi"
                          ],
                          "operator": "AND",
                          "lenient": "true",
                          "max_expansions": 1024
                        }
                      },
                      {
                        "multi_match": {
                          "query": keywords,
                          "type": "cross_fields",
                          "fields": [
                            "projectNameFi^2",
                            "projectNameEn^2",
                            "projectNameSv^2",
                            "projectAcronym",
                            "projectDescriptionFi",
                            "projectDescriptionEn",
                            "projectDescriptionSv",
                            "fundingStartYear",
                            "fundingContactPersonLastName",
                            "fundingContactPersonFirstNames",
                            "funderNameFi",
                            "funderNameEn",
                            "funderNameSv",
                            "funderNameUnd",
                            "typeOfFundingId",
                            "typeOfFundingNameFi",
                            "typeOfFundingNameEn",
                            "typeOfFundingNameSv",
                            "callProgrammeNameFi",
                            "callProgrammeNameEn",
                            "callProgrammeNameSv",
                            "callProgrammeHomepage",
                            "callProgrammeUnd",
                            "funderProjectNumber",
                            "relatedFunding.funderProjectNumber",
                            "keywords.keyword",
                            "keyword.scheme",
                            "fundedNameFi",
                            "funderNameFi"
                          ],
                          "operator": "AND",
                          "lenient": "true"
                        }
                      },
                      {
                        "bool": {
                          "should": [
                            {
                              "nested": {
                                "path": "organizationConsortium",
                                "query": {
                                  "multi_match": {
                                    "query": keywords,
                                    "type": "cross_fields",
                                    "fields": [
                                      "organizationConsortium.consortiumOrganizationNameFi",
                                      "organizationConsortium.consortiumOrganizationNameEn",
                                      "organizationConsortium.consortiumOrganizationNameSv",
                                      "organizationConsortium.roleInConsortium",
                                      "fundingGroupPerson.fundingGroupPersonFirstNames",
                                      "fundingGroupPerson.fundingGroupPersonLastName",
                                      "fundingGroupPerson.consortiumOrganizationBusinessId",
                                      "fundingGroupPerson.consortiumOrganizationNameFi",
                                      "fundingGroupPerson.consortiumOrganizationNameEn",
                                      "fundingGroupPerson.consortiumOrganizationNameSv",
                                      "fundingGroupPerson.roleInFundingGroup",
                                      "fundingGroupPerson.consortiumProject",
                                      "keywords.keyword"
                                    ],
                                    "operator": "AND",
                                    "lenient": "true"
                                  }
                                }
                              }
                            },
                            {
                              "nested": {
                                "path": "fundingGroupPerson",
                                "query": {
                                  "multi_match": {
                                    "query": keywords,
                                    "type": "cross_fields",
                                    "fields": [
                                      "organizationConsortium.consortiumOrganizationNameFi",
                                      "organizationConsortium.consortiumOrganizationNameEn",
                                      "organizationConsortium.consortiumOrganizationNameSv",
                                      "organizationConsortium.roleInConsortium",
                                      "fundingGroupPerson.fundingGroupPersonFirstNames",
                                      "fundingGroupPerson.fundingGroupPersonLastName",
                                      "fundingGroupPerson.consortiumOrganizationBusinessId",
                                      "fundingGroupPerson.consortiumOrganizationNameFi",
                                      "fundingGroupPerson.consortiumOrganizationNameEn",
                                      "fundingGroupPerson.consortiumOrganizationNameSv",
                                      "fundingGroupPerson.roleInFundingGroup",
                                      "fundingGroupPerson.consortiumProject",
                                      "keywords.keyword"
                                    ],
                                    "operator": "AND",
                                    "lenient": "true"
                                  }
                                }
                              }
                            },
                            {
                              "nested": {
                                "path": "keywords",
                                "query": {
                                  "multi_match": {
                                    "query": keywords,
                                    "type": "cross_fields",
                                    "fields": [
                                      "organizationConsortium.consortiumOrganizationNameFi",
                                      "organizationConsortium.consortiumOrganizationNameEn",
                                      "organizationConsortium.consortiumOrganizationNameSv",
                                      "organizationConsortium.roleInConsortium",
                                      "fundingGroupPerson.fundingGroupPersonFirstNames",
                                      "fundingGroupPerson.fundingGroupPersonLastName",
                                      "fundingGroupPerson.consortiumOrganizationBusinessId",
                                      "fundingGroupPerson.consortiumOrganizationNameFi",
                                      "fundingGroupPerson.consortiumOrganizationNameEn",
                                      "fundingGroupPerson.consortiumOrganizationNameSv",
                                      "fundingGroupPerson.roleInFundingGroup",
                                      "fundingGroupPerson.consortiumProject",
                                      "keywords.keyword"
                                    ],
                                    "operator": "AND",
                                    "lenient": "true"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "bool": {
              "must": [
                {
                  "term": {
                    "_index": "dataset"
                  }
                },
                {
                  "bool": {
                    "should": [
                      {
                        "multi_match": {
                          "query": keywords,
                          "analyzer": "standard",
                          "type": "phrase_prefix",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "descriptionFi",
                            "descriptionEn",
                            "descriptionSv",
                            "datasetCreated",
                            "fieldsOfScience.nameFiScience",
                            "fieldsOfScience.nameEnScience",
                            "fieldsOfScience.nameSvScience",
                            "identifier",
                            "accessType",
                            "keywords.keyword",
                            "dataCatalog.identifier",
                            "dataCatalog.nameFi",
                            "dataCatalog.nameEn",
                            "dataCatalog.nameSv",
                            "fairdataUrl"
                          ],
                          "operator": "AND",
                          "lenient": "true",
                          "max_expansions": 1024
                        }
                      },
                      {
                        "multi_match": {
                          "query": keywords,
                          "type": "cross_fields",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "descriptionFi",
                            "descriptionEn",
                            "descriptionSv",
                            "datasetCreated",
                            "fieldsOfScience.nameFiScience",
                            "fieldsOfScience.nameEnScience",
                            "fieldsOfScience.nameSvScience",
                            "identifier",
                            "accessType",
                            "keywords.keyword",
                            "dataCatalog.identifier",
                            "dataCatalog.nameFi",
                            "dataCatalog.nameEn",
                            "dataCatalog.nameSv",
                            "fairdataUrl"
                          ],
                          "operator": "AND",
                          "lenient": "true"
                        }
                      },
                      {
                        "bool": {
                          "should": {
                            "nested": {
                              "path": "actor.sector",
                              "query": {
                                "multi_match": {
                                  "query": keywords,
                                  "type": "cross_fields",
                                  "fields": [
                                    "actor.sector.organization.OrganizationNameFi",
                                    "actor.sector.organization.OrganizationNameEn",
                                    "actor.sector.organization.OrganizationNameSv",
                                    "actor.sector.organization.organizationUnit.organizationUnitNameFi",
                                    "actor.sector.organization.organizationUnit.organizationUnitNameEn",
                                    "actor.sector.organization.organizationUnit.organizationUnitNameSv",
                                    "actor.sector.organization.organizationUnit.person.authorFullName"
                                  ],
                                  "operator": "AND",
                                  "lenient": "true"
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "bool": {
              "must": [
                {
                  "term": {
                    "_index": "infrastructure"
                  }
                },
                {
                  "bool": {
                    "should": [
                      {
                        "multi_match": {
                          "query": keywords,
                          "analyzer": "standard",
                          "type": "phrase_prefix",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "descriptionFi",
                            "descriptionEn",
                            "descriptionSv",
                            "scientificDescriptionFi",
                            "scientificDescriptionSv",
                            "scientificDescriptionEn",
                            "startYear",
                            "acronym",
                            "responsibleOrganizationNameFi",
                            "responsibleOrganizationNameEn",
                            "responsibleOrganizationNameSv",
                            "keywordsFi.keyword",
                            "keywordsSv.keyword",
                            "keywordsEn.keyword",
                            "services.serviceNameFi",
                            "services.serviceNameSv",
                            "services.serviceNameEn",
                            "services.serviceDescriptionFi",
                            "services.serviceDescriptionSv",
                            "services.serviceDescriptionEn",
                            "services.serviceType",
                            "services.servicePointName",
                            "services.serviceAcronym",
                            "services.servicePointEmailAddress",
                            "services.servicePointInfoUrlFi",
                            "services.servicePointInfoUrlEn",
                            "services.servicePointInfoUrlSv",
                            "services.servicePointPhoneNumber",
                            "services.servicePointVisitingAddress"
                          ],
                          "operator": "AND",
                          "lenient": "true",
                          "max_expansions": 1024
                        }
                      },
                      {
                        "multi_match": {
                          "query": keywords,
                          "type": "cross_fields",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "descriptionFi",
                            "descriptionEn",
                            "descriptionSv",
                            "scientificDescriptionFi",
                            "scientificDescriptionSv",
                            "scientificDescriptionEn",
                            "startYear",
                            "acronym",
                            "responsibleOrganizationNameFi",
                            "responsibleOrganizationNameEn",
                            "responsibleOrganizationNameSv",
                            "keywordsFi.keyword",
                            "keywordsSv.keyword",
                            "keywordsEn.keyword",
                            "services.serviceNameFi",
                            "services.serviceNameSv",
                            "services.serviceNameEn",
                            "services.serviceDescriptionFi",
                            "services.serviceDescriptionSv",
                            "services.serviceDescriptionEn",
                            "services.serviceType",
                            "services.servicePointName",
                            "services.serviceAcronym",
                            "services.servicePointEmailAddress",
                            "services.servicePointInfoUrlFi",
                            "services.servicePointInfoUrlEn",
                            "services.servicePointInfoUrlSv",
                            "services.servicePointPhoneNumber",
                            "services.servicePointVisitingAddress"
                          ],
                          "operator": "AND",
                          "lenient": "true"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "bool": {
              "must": [
                {
                  "term": {
                    "_index": "organization"
                  }
                },
                {
                  "bool": {
                    "should": [
                      {
                        "multi_match": {
                          "query": keywords,
                          "analyzer": "standard",
                          "type": "phrase_prefix",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "variantNames",
                            "organizationBackground",
                            "predecessors.nameFi",
                            "related",
                            "homepage",
                            "visitingAddress",
                            "businessId",
                            "subUnits"
                          ],
                          "operator": "AND",
                          "lenient": "true",
                          "max_expansions": 1024
                        }
                      },
                      {
                        "multi_match": {
                          "query": keywords,
                          "type": "cross_fields",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "variantNames",
                            "organizationBackground",
                            "predecessors.nameFi",
                            "related",
                            "homepage",
                            "visitingAddress",
                            "businessId",
                            "subUnits"
                          ],
                          "operator": "AND",
                          "lenient": "true"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "bool": {
              "must": [
                {
                  "term": {
                    "_index": "funding-call"
                  }
                },
                {
                  "bool": {
                    "should": [
                      {
                        "multi_match": {
                          "query": keywords,
                          "analyzer": "standard",
                          "type": "phrase_prefix",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "descriptionFi",
                            "descriptionSv",
                            "descriptionEn",
                            "foundation.nameFi",
                            "foundation.nameSv",
                            "foundation.nameEn"
                          ],
                          "operator": "AND",
                          "lenient": "true",
                          "max_expansions": 1024
                        }
                      },
                      {
                        "multi_match": {
                          "query": keywords,
                          "type": "cross_fields",
                          "fields": [
                            "nameFi^2",
                            "nameEn^2",
                            "nameSv^2",
                            "descriptionFi",
                            "descriptionSv",
                            "descriptionEn",
                            "foundation.nameFi",
                            "foundation.nameSv",
                            "foundation.nameEn"
                          ],
                          "operator": "AND",
                          "lenient": "true"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    "size": 0,
    "aggs": {
      "_index": {
        "filters": {
          "filters": {
            "publications": {
              "match": {
                "_index": "publication"
              }
            },
            "persons": {
              "match": {
                "_index": "person"
              }
            },
            "fundings": {
              "match": {
                "_index": "funding"
              }
            },
            "datasets": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "_index": "dataset"
                    }
                  },
                  {
                    "term": {
                      "isLatestVersion": 1
                    }
                  }
                ]
              }
            },
            "infrastructures": {
              "match": {
                "_index": "infrastructure"
              }
            },
            "organizations": {
              "match": {
                "_index": "organization"
              }
            },
            "fundingCalls": {
              "match": {
                "_index": "funding-call"
              }
            }
          }
        }
      }
    }
  }
}
