import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { SortService } from '../sort.service';
import { SettingsService } from '../settings.service';

@Injectable({
  providedIn: 'root',
})
export class AggregationService {
  localeC: string;
  today: string;

  constructor(
    private sortService: SortService,
    private settingsService: SettingsService,
    @Inject(LOCALE_ID) protected localeId: string
  ) {
    this.localeC =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  // Check current ui language
  langByLocale(locale) {
    let field: string;
    switch (locale) {
      case 'fi': {
        field = 'languageFi';
        break;
      }
      case 'sv': {
        field = 'languageSv';
        break;
      }
      case 'en': {
        field = 'languageEn';
        break;
      }
    }
    return field;
  }

  constructAggregations(
    filters: any,
    tab: string,
    searchTerm: string,
    disableFiltering = false
  ) {
    // Filter active filters based on aggregation type. We have simple terms, nested and multiple nested aggregations by data mappings
    const active = filters.filter(
      (item) =>
        item.bool?.should.length > 0 &&
        !item.bool.should[0].nested &&
        !item.bool.should[0].bool
    );
    // Active bool filters come from aggregations that contain multiple terms, eg composite aggregation
    const activeBool = filters.filter((item) => item.bool?.should[0]?.bool);
    // Active bool filtered filters come from date ranges (status)
    const activeFiltered = filters.filter(
      (item) => item.bool?.should?.bool?.filter.length
    );
    const activeNested = filters.filter(
      (item) =>
        item.nested?.query.bool.should?.length > 0 ||
        item.nested?.query.bool.must.bool.should.length > 0
    );
    const activeMultipleNested = filters.filter(
      (item) => item.bool?.should.length > 0 && item.bool.should[0]?.nested
    );

    // With co-publication filter on we need to filter filter values with organizations that are in co-publication.
    const coPublication = active.find(
      (item) => item.bool?.should[0].term['publicationStatusCode.keyword']
    );

    const coPublicationFilter = filters.filter(
      (item) => item.bool?.should.nested?.path === 'author'
    );

    // Functions to filter out active filters. These prevents doc count changes on active filter categories
    // Filtering is disabled for active filters translations
    function filterActive(field) {
      if (!disableFiltering) {
        // Open access aggregations come from 3 different aggs and need special case for filters
        if (field === 'openAccess') {
          const filteredActive = active.filter(
            (item) =>
              Object.keys(item.bool.should[0].term)?.toString() !==
                'openAccessCode' &&
              Object.keys(item.bool.should[0].term)?.toString() !==
                'selfArchivedCode'
          );
          return filteredActive.concat(
            activeFiltered,
            activeNested,
            activeMultipleNested,
            coPublication ? coPublicationFilter : []
          );
        } else {
          return active
            .filter(
              (item) =>
                Object.keys(item.bool.should[0].term)?.toString() !== field
            )
            .concat(
              activeFiltered,
              activeNested,
              activeMultipleNested,
              activeBool,
              coPublication ? coPublicationFilter : []
            );
        }
      }
    }

    function filterActiveNested(path) {
      if (!disableFiltering) {
        return activeNested
          .filter((item) => item.nested?.path !== path)
          .concat(
            active,
            activeMultipleNested,
            activeFiltered,
            activeBool,
            coPublication ? coPublicationFilter : []
          );
      }
    }

    function filterActiveFiltered() {
      if (!disableFiltering) {
        return activeBool
          .filter((item) => !item.bool.should[0].bool.filter)
          .concat(
            active,
            activeNested,
            activeFiltered,
            activeMultipleNested,
            coPublication ? coPublicationFilter : []
          );
      }
    }

    // TODO: Don't rely on path order. Use protype find instead
    function filterActiveMultipleNested(path1, path2) {
      if (!disableFiltering) {
        const res = activeMultipleNested
          .filter((item) => item.bool.should[0].nested.path !== path2)
          .concat(
            activeMultipleNested.filter(
              (item) => item.bool.should[1].nested.path !== path1
            ),
            coPublication ? coPublicationFilter : []
          );
        return res.concat(
          active,
          activeNested,
          activeFiltered,
          activeBool,
          coPublication ? coPublicationFilter : []
        );
      }
    }

    const yearAgg = {
      filter: {
        bool: {
          filter: filterActive(this.sortService.yearField),
        },
      },
      aggs: {
        years: {
          terms: {
            field: this.sortService.yearField,
            order: { _key: 'desc' },
            size: 100,
          },
        },
      },
    };

    const yearAggDatasets = {
      filter: {
        bool: {
          filter: filterActive(this.sortService.yearField),
          should: {
            term: { isLatestVersion: 1 },
          },
        },
      },
      aggs: {
        years: {
          terms: {
            field: this.sortService.yearField,
            order: { _key: 'desc' },
            size: 100,
          },
        },
      },
    };

    // Testing purposes
    const basicAgg = (
      filterMethod: any,
      path: string,
      fieldName: string,
      orderBy: string,
      sizeOf: number,
      isDatasetsSection: boolean
    ) => {
      return {
        filter: {
          bool: {
            filter: filterMethod,
            ...(isDatasetsSection
              ? {
                  should: {
                    term: { isLatestVersion: 1 },
                  },
                }
              : []),
          },
        },
        aggs: {
          [path]: {
            terms: {
              field: fieldName,
              ...(orderBy ? { order: { _key: orderBy } } : []),
              ...(sizeOf ? { size: sizeOf } : []),
            },
          },
        },
      };
    };

    // Aggregations
    const payLoad: any = {
      ...(searchTerm
        ? {
            query: {
              // Get query settings and perform aggregations based on tab. Nested filters use reverse nested aggregation to filter out fields
              // outside path.
              bool: {
                should: [
                  this.settingsService.querySettings(
                    tab !== 'news' ? tab.slice(0, -1) : tab,
                    searchTerm
                  ),
                ],
              },
            },
          }
        : []),
      size: 0,
      aggs: {},
    };

    // Testing purposes
    const terms = (
      fieldName: string,
      orderBy: string,
      sizeOf: number,
      exclusion: any
    ) => {
      return {
        terms: {
          field: fieldName,
          ...(orderBy ? { order: { _key: orderBy } } : []),
          ...(sizeOf ? { size: sizeOf } : []),
          ...(exclusion ? { exclude: exclusion } : []),
        },
      };
    };

    switch (tab) {
      case 'publications':
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.organization = {
          nested: {
            path: 'author',
          },
          aggs: {
            sectorName: {
              terms: {
                size: 50,
                field: 'author.name' + this.localeC + 'Sector.keyword',
                exclude: ' ',
              },
              aggs: {
                sectorId: {
                  terms: {
                    size: 50,
                    field: 'author.sectorId.keyword',
                  },
                },
                organization: {
                  nested: {
                    path: 'author.organization',
                  },
                  aggs: {
                    org: {
                      terms: {
                        size: 50,
                        field:
                          'author.organization.OrganizationName' +
                          this.localeC +
                          '.keyword',
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveNested('author'),
                                },
                              },
                            },
                          },
                        },
                        orgId: {
                          terms: {
                            size: 10,
                            field: 'author.organization.organizationId.keyword',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.countryCode = {
          filter: {
            bool: {
              filter: filterActive('internationalPublication'),
            },
          },
          aggs: {
            countryCodes: {
              terms: {
                field: 'internationalPublication',
                order: { _key: 'asc' },
                size: 50,
              },
            },
          },
        };
        payLoad.aggs.lang = {
          filter: {
            bool: {
              filter: filterActive('languages.languageCode'),
            },
          },
          aggs: {
            langs: {
              terms: {
                field: 'languages.languageCode.keyword',
                size: 50,
              },
              aggs: {
                language: {
                  terms: {
                    field:
                      'languages.' +
                      this.langByLocale(this.localeId) +
                      '.keyword',
                    size: 100,
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.publicationType = {
          filter: {
            bool: {
              filter: filterActive('publicationTypeCode.keyword'),
            },
          },
          aggs: {
            publicationTypes: {
              terms: {
                field: 'publicationTypeCode.keyword',
                size: 50,
                exclude: ' ',
                order: {
                  _key: 'asc',
                },
              },
            },
          },
        };
        payLoad.aggs.publicationFormat = {
          filter: {
            bool: {
              filter: filterActive('publicationFormat.id.keyword'),
            },
          },
          aggs: {
            publicationFormats: {
              terms: {
                field:
                  'publicationFormat.name' +
                  this.localeC +
                  'PublicationFormat.keyword',
                exclude: ' ',
              },
              aggs: {
                id: {
                  terms: {
                    field: 'publicationFormat.id.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.publicationAudience = {
          filter: {
            bool: {
              filter: filterActive('publicationAudience.id.keyword'),
            },
          },
          aggs: {
            publicationAudiences: {
              terms: {
                field:
                  'publicationAudience.name' +
                  this.localeC +
                  'PublicationAudience.keyword',
                exclude: ' ',
              },
              aggs: {
                id: {
                  terms: {
                    field: 'publicationAudience.id.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.parentPublicationType = {
          filter: {
            bool: {
              filter: filterActive('parentPublicationType.id.keyword'),
            },
          },
          aggs: {
            parentPublicationTypes: {
              terms: {
                field:
                  'parentPublicationType.name' +
                  this.localeC +
                  'ParentPublicationType.keyword',
                exclude: ' ',
              },
              aggs: {
                id: {
                  terms: {
                    field: 'parentPublicationType.id.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.peerReviewed = {
          filter: {
            bool: {
              filter: filterActive('peerReviewed.id.keyword'),
            },
          },
          aggs: {
            peerReviewedValues: {
              terms: {
                field:
                  'peerReviewed.name' + this.localeC + 'PeerReviewed.keyword',
                exclude: ' ',
              },
              aggs: {
                id: {
                  terms: {
                    field: 'peerReviewed.id.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.juFo = {
          filter: {
            bool: {
              filter: filterActive('jufoClassCode.keyword'),
            },
          },
          aggs: {
            juFoCodes: {
              terms: {
                field: 'jufoClassCode.keyword',
                order: {
                  _key: 'desc',
                },
              },
            },
          },
        };
        payLoad.aggs.articleType = {
          filter: {
            bool: {
              filter: filterActive('articleTypeCode'),
            },
          },
          aggs: {
            articleTypes: {
              terms: {
                field: 'articleTypeCode',
                order: {
                  _key: 'desc',
                },
              },
            },
          },
        };
        payLoad.aggs.internationalCollaboration = {
          filter: {
            bool: {
              filter: filterActive('internationalCollaboration'),
            },
          },
          aggs: {
            internationalCollaborationCodes: {
              terms: {
                field: 'internationalCollaboration',
                size: 2,
              },
            },
          },
        };
        payLoad.aggs.okmDataCollection = {
          filter: {
            bool: {
              filter: filterActive('publicationStatusCode.keyword'),
            },
          },
          aggs: {
            publicationStatusCodes: {
              terms: {
                field: 'publicationStatusCode.keyword',
                size: 10,
              },
            },
          },
        };
        // Field of science
        payLoad.aggs.field = {
          nested: {
            path: 'fieldsOfScience',
          },
          aggs: {
            fields: {
              terms: {
                field:
                  'fieldsOfScience.name' + this.localeC + 'Science.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience'),
                        },
                      },
                    },
                  },
                },
                fieldId: {
                  terms: {
                    field: 'fieldsOfScience.fieldIdScience',
                  },
                },
              },
            },
          },
        };
        // Open access
        payLoad.aggs.selfArchived = {
          filter: {
            bool: {
              filter: filterActive('openAccess'),
            },
          },
          aggs: {
            selfArchivedCodes: {
              terms: {
                field: 'selfArchivedCode',
              },
            },
          },
        };
        payLoad.aggs.openAccess = {
          filter: {
            bool: {
              filter: filterActive('openAccess'),
            },
          },
          aggs: {
            openAccessCodes: {
              terms: {
                field: 'openAccessCode',
              },
            },
          },
        };
        // Composite is to get aggregation of selfarchived and open access codes of 0
        payLoad.aggs.oaComposite = {
          composite: {
            sources: [
              {
                selfArchived: {
                  terms: {
                    field: 'selfArchivedCode',
                  },
                },
              },
              {
                openAccess: {
                  terms: {
                    field: 'openAccessCode',
                  },
                },
              },
            ],
          },
          aggs: {
            filtered: {
              filter: {
                bool: {
                  filter: filterActive('openAccess'),
                },
              },
            },
          },
        };
        payLoad.aggs.oaPublisherComposite = {
          composite: {
            size: 20,
            sources: [
              {
                openAccess: {
                  terms: {
                    field: 'openAccess',
                  },
                },
              },
              {
                publisherOpenAccess: {
                  terms: {
                    field: 'publisherOpenAccessCode',
                  },
                },
              },
              {
                selfArchived: {
                  terms: {
                    field: 'selfArchivedCode',
                  },
                },
              },
            ],
          },
          aggs: {
            filtered: {
              filter: {
                bool: {
                  filter: filterActive('openAccess'),
                },
              },
            },
          },
        };
        break;
      case 'persons':
        payLoad.aggs.organization = {
          nested: {
            path: 'activity.affiliations.sector',
          },
          aggs: {
            sectorName: {
              terms: {
                size: 50,
                field:
                  'activity.affiliations.sector.name' +
                  this.localeC +
                  'Sector.keyword',
                exclude: ' ',
              },
              aggs: {
                sectorId: {
                  terms: {
                    size: 50,
                    field: 'activity.affiliations.sector.sectorId.keyword',
                  },
                },
                org: {
                  nested: {
                    path: 'activity.affiliations.sector.organization',
                  },
                  aggs: {
                    organization: {
                      terms: {
                        size: 50,
                        field:
                          'activity.affiliations.sector.organization.organizationName' +
                          this.localeC +
                          '.keyword',
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveNested('activity'),
                                },
                              },
                            },
                          },
                        },
                        orgId: {
                          terms: {
                            size: 10,
                            field:
                              'activity.affiliations.sector.organization.organizationId.keyword',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };

        payLoad.aggs.keyword = {
          terms: {
            field: "personal.keywords.value.keyword"
          }
        }

        payLoad.aggs.position = {
          nested: {
            path: "activity.affiliations"
          },
          aggs: {
            positions: {
              terms: {
                field: "activity.affiliations.positionNameFi.keyword",
                exclude: " ",
              }
            }
          }
        };

        break;
      case 'fundings':
        payLoad.aggs.year = yearAgg;
        // Funder
        payLoad.aggs.funder = {
          filter: {
            bool: {
              filter: filterActive('funderBusinessId.pid_content.keyword'),
            },
          },
          aggs: {
            funders: {
              terms: {
                field: 'funderName' + this.localeC + '.keyword',
                size: 250,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                funderId: {
                  terms: {
                    field: 'funderBusinessId.pid_content.keyword',
                  },
                },
              },
            },
          },
        };
        // Sector & organization
        payLoad.aggs.organization = {
          nested: {
            path: 'fundingGroupPerson',
          },
          aggs: {
            funded: {
              filter: {
                terms: {
                  'fundingGroupPerson.fundedPerson': [1],
                },
              },
              aggs: {
                sectorName: {
                  terms: {
                    size: 50,
                    field:
                      'fundingGroupPerson.fundedPersonOrganizationName' +
                      this.localeC +
                      '.keyword',
                    exclude: ' |Rahoittaja|Funder|Finansiär',
                  },
                  aggs: {
                    sectorId: {
                      terms: {
                        size: 50,
                        field:
                          'fundingGroupPerson.fundedPersonOrganizationSectorId.keyword',
                      },
                    },
                    organizations: {
                      terms: {
                        size: 50,
                        field:
                          'fundingGroupPerson.consortiumOrganizationName' +
                          this.localeC +
                          '.keyword',
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveMultipleNested(
                                    'fundingGroupPerson',
                                    'organizationConsortium'
                                  ),
                                },
                              },
                            },
                          },
                        },
                        orgId: {
                          terms: {
                            size: 1,
                            field:
                              'fundingGroupPerson.consortiumOrganizationId.keyword',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.organizationConsortium = {
          nested: {
            path: 'organizationConsortium',
          },
          aggs: {
            funded: {
              filter: {
                terms: {
                  'organizationConsortium.isFinnishOrganization': [1],
                },
              },
              aggs: {
                sectorName: {
                  terms: {
                    size: 50,
                    field:
                      'organizationConsortium.consortiumSectorName' +
                      this.localeC +
                      '.keyword',
                    exclude: ' |Rahoittaja|Funder|Finansiär',
                  },
                  aggs: {
                    sectorId: {
                      terms: {
                        size: 50,
                        field:
                          'organizationConsortium.consortiumSectorId.keyword',
                      },
                    },
                    organizations: {
                      terms: {
                        size: 50,
                        field:
                          'organizationConsortium.consortiumOrganizationName' +
                          this.localeC +
                          '.keyword',
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveMultipleNested(
                                    'fundingGroupPerson',
                                    'organizationConsortium'
                                  ),
                                },
                              },
                            },
                          },
                        },
                        orgId: {
                          terms: {
                            size: 1,
                            field:
                              'organizationConsortium.consortiumOrganizationId.keyword',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        // Type of funding
        payLoad.aggs.typeOfFunding = {
          filter: {
            bool: {
              filter: filterActive('typeOfFundingId.keyword'),
            },
          },
          aggs: {
            types: {
              terms: {
                field: 'typeOfFunding.typeOfFundingHeaderId.keyword',
                exclude: ' ',
              },
              aggs: {
                headerFi: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameFi.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc',
                    },
                  },
                  aggs: {
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                  },
                },
                headerEn: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameEn.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc',
                    },
                  },
                  aggs: {
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                  },
                },
                headerSv: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameSv.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc',
                    },
                  },
                  aggs: {
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' ',
                        size: 50,
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' ',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        // Field of science
        payLoad.aggs.field = {
          nested: {
            path: 'fieldsOfScience',
          },
          aggs: {
            fields: {
              terms: {
                field:
                  'fieldsOfScience.name' + this.localeC + 'Science.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience'),
                        },
                      },
                    },
                  },
                },
                fieldId: {
                  terms: {
                    field: 'fieldsOfScience.fieldIdScience',
                  },
                },
              },
            },
          },
        };

        payLoad.aggs.fundingStatus = {
          filter: {
            bool: {
              filter: filterActive('fundingEndDate'),
            },
          },
          aggs: {
            status: {
              range: {
                field: 'fundingEndDate',
                ranges: [
                  {
                    from: this.today,
                  },
                ],
              },
            },
          },
        };

        payLoad.aggs.topic = {
          nested: {
            path: 'keywords',
          },
          aggs: {
            scheme: {
              terms: {
                field: 'keywords.scheme.keyword',
                exclude: ' ',
                size: 10,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                keywords: {
                  terms: {
                    field: 'keywords.keyword.keyword',
                    exclude: ' ',
                    size: 250,
                  },
                  aggs: {
                    filtered: {
                      reverse_nested: {},
                      aggs: {
                        filterCount: {
                          filter: {
                            bool: {
                              filter: filterActiveNested('keywords'),
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };

        break;
      // Datasets
      case 'datasets':
        payLoad.aggs.year = yearAggDatasets;
        payLoad.aggs.dataSource = basicAgg(
          filterActive('dataCatalog.name' + this.localeC + '.keyword'),
          'dataSources',
          'dataCatalog.name' + this.localeC + '.keyword',
          null,
          null,
          true
        );
        payLoad.aggs.accessType = basicAgg(
          filterActive('accessType.keyword'),
          'accessTypes',
          'accessType.keyword',
          null,
          null,
          true
        );
        payLoad.aggs.organization = {
          nested: {
            path: 'actor.sector',
          },
          aggs: {
            sectorName: {
              terms: {
                size: 50,
                field: 'actor.sector.name' + this.localeC + 'Sector.keyword',
                exclude: ' ',
              },
              aggs: {
                sectorId: {
                  terms: {
                    size: 50,
                    field: 'actor.sector.sectorId.keyword',
                  },
                },
                org: {
                  nested: {
                    path: 'actor.sector.organization',
                  },
                  aggs: {
                    organization: {
                      terms: {
                        size: 50,
                        field:
                          'actor.sector.organization.OrganizationName' +
                          this.localeC +
                          '.keyword',
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveNested('actor'),
                                  should: {
                                    term: { isLatestVersion: 1 },
                                  },
                                },
                              },
                            },
                          },
                        },
                        orgId: {
                          terms: {
                            size: 10,
                            field:
                              'actor.sector.organization.organizationId.keyword',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.lang = {
          nested: {
            path: 'languages',
          },
          aggs: {
            langs: {
              terms: {
                field: 'languages.languageCode.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('languages'),
                          should: {
                            term: { isLatestVersion: 1 },
                          },
                        },
                      },
                    },
                  },
                },
                language: {
                  terms: {
                    field: 'languages.languageName' + this.localeC + '.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.field = {
          nested: {
            path: 'fieldsOfScience',
          },
          aggs: {
            fields: {
              terms: {
                field:
                  'fieldsOfScience.name' + this.localeC + 'Science.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience'),
                          should: {
                            term: { isLatestVersion: 1 },
                          },
                        },
                      },
                    },
                  },
                },
                fieldId: {
                  terms: {
                    field: 'fieldsOfScience.fieldIdScience',
                  },
                },
              },
            },
          },
        };
        // payLoad.aggs.field = {
        //   filter: {
        //     bool: {
        //       filter: filterActive('fieldsOfScience.fieldIdScience'),
        //     },
        //   },
        //   aggs: {
        //     fields: {
        //       terms: {
        //         field:
        //           'fieldsOfScience.name' + this.localeC + 'Science.keyword',
        //         exclude: ' ',
        //         size: 250,
        //         order: {
        //           _key: 'asc',
        //         },
        //       },
        //       aggs: {
        //         fieldId: {
        //           terms: {
        //             field: 'fieldsOfScience.fieldIdScience',
        //           },
        //         },
        //       },
        //     },
        //   },
        // };

        break;
      // Infrastructures
      case 'infrastructures': {
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.type = basicAgg(
          filterActive('services.serviceType.keyword'),
          'types',
          'services.serviceType.keyword',
          null,
          null,
          false
        );
        payLoad.aggs.organization = {
          filter: {
            bool: {
              filter: filterActive(
                'responsibleOrganization.TKOppilaitosTunnus.keyword'
              ),
            },
          },
          aggs: {
            sector: {
              terms: {
                field:
                  'responsibleOrganization.responsibleOrganizationSector' +
                  this.localeC +
                  '.keyword',
                exclude: ' ',
              },
              aggs: {
                organizations: {
                  terms: {
                    field:
                      'responsibleOrganization.responsibleOrganizationName' +
                      this.localeC +
                      '.keyword',
                    exclude: ' ',
                  },
                  aggs: {
                    organizationId: {
                      terms: {
                        field:
                          'responsibleOrganization.TKOppilaitosTunnus.keyword',
                        exclude: ' ',
                      },
                    },
                  },
                },
                sectorId: {
                  terms: {
                    field:
                      'responsibleOrganization.responsibleOrganizationSectorId.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.infraField = {
          nested: {
            path: 'fieldsOfScience',
          },
          aggs: {
            infraFields: {
              terms: {
                field: 'fieldsOfScience.name' + this.localeC + '.keyword',
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience'),
                        },
                      },
                    },
                  },
                },
                majorId: {
                  terms: {
                    field: 'fieldsOfScience.field_id.keyword',
                  },
                },
              },
            },
          },
        };
        break;
      }
      // Organizations
      case 'organizations':
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.sector = {
          filter: {
            bool: {
              filter: filterActive('sectorId.keyword'),
            },
          },
          aggs: {
            sectorId: {
              terms: {
                field: 'sectorId.keyword',
                size: 50,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                sectorName: {
                  terms: {
                    field: 'sectorName' + this.localeC + '.keyword',
                  },
                },
              },
            },
          },
        };
        // organization agg is for filter translations
        payLoad.aggs.organization = {
          filter: {
            bool: {
              filter: filterActive('sectorId.keyword'),
            },
          },
          aggs: {
            organizationName: {
              terms: {
                field: 'name' + this.localeC + '.keyword',
                size: 50,
                order: {
                  _key: 'asc',
                },
              },
              aggs: {
                organizationId: {
                  terms: {
                    field: 'organizationId.keyword',
                  },
                },
              },
            },
          },
        };
        break;

      // Funding-calls

      case 'funding-calls':
        payLoad.aggs.mainCategory = {
          nested: {
            path: 'categories',
          },
          aggs: {
            mainCategoryId: {
              terms: {
                field: 'categories.broaderCodeValue.keyword',
              },
              aggs: {
                mainCategoryName: {
                  terms: {
                    size: 50,
                    field: 'categories.broaderName' + this.localeC + '.keyword',
                  },
                },
              },
            },
          },
        };
        // payLoad.aggs.year = yearAgg;
        payLoad.aggs.field = {
          nested: {
            path: 'categories',
          },
          aggs: {
            field: {
              terms: {
                field: 'categories.name' + this.localeC + '.keyword',
                size: 100,
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('categories'),
                        },
                      },
                    },
                  },
                },
                fieldId: {
                  terms: {
                    field: 'categories.codeValue.keyword',
                  },
                },
                parentFieldId: {
                  terms: {
                    field: 'categories.broaderCodeValue.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.organization = {
          filter: {
            bool: {
              filter: filterActive('foundation.businessId.keyword'),
            },
          },
          aggs: {
            orgId: {
              terms: {
                field: 'foundation.businessId.keyword',
                size: 500,
                order: {
                  _key: 'asc',
                },
                exclude: ' ',
              },
              aggs: {
                orgName: {
                  terms: {
                    field: 'foundation.name' + this.localeC + '.keyword',
                  },
                },
              },
            },
          },
        };
        payLoad.aggs.status = {
          composite: {
            size: 2000,
            sources: [
              {
                openDate: {
                  date_histogram: {
                    field: 'callProgrammeOpenDate',
                    calendar_interval: '1d',
                    format: 'yyyy-MM-dd',
                  },
                },
              },
              {
                dueDate: {
                  date_histogram: {
                    field: 'callProgrammeDueDate',
                    calendar_interval: '1d',
                    format: 'yyyy-MM-dd',
                  },
                },
              },
            ],
          },
          aggs: {
            filtered: {
              filter: {
                bool: {
                  filter: filterActiveFiltered(),
                },
              },
            },
          },
        };
        break;
      // News
      case 'news':
        payLoad.aggs.organization = {
          terms: {
            field: 'sectorId.keyword',
          },
          aggs: {
            sectorName: {
              terms: {
                field: 'sectorName' + this.localeC + '.keyword',
              },
            },
            orgName: {
              terms: {
                size: 25,
                field: 'organizationNameFi.keyword',
              },
              aggs: {
                orgId: {
                  terms: {
                    field: 'organizationId.keyword',
                  },
                },
              },
            },
          },
        };
        break;
      default:
        break;
    }
    return payLoad;
  }
}
