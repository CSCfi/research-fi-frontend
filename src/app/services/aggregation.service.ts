import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { SortService } from './sort.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class AggregationService {
  localeC: string;
  today: string;

  constructor(private sortService: SortService, private settingsService: SettingsService,
              @Inject( LOCALE_ID ) protected localeId: string) {
                this.localeC = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
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

  constructAggregations(filters: any, tab: string, searchTerm: string) {
    // Filter active filters based on aggregation type. We have simple terms, nested and multiple nested aggregations by data mappings
    const active = filters.filter(item => item.bool?.should.length > 0 && !item.bool.should[0].nested && !item.bool.should[0].bool);
    // Actice bool filters come from aggregations that contain multiple terms, eg composite aggregation
    const activeBool = filters.filter(item => item.bool?.should[0]?.bool);
    const activeNested = filters.filter(item => item.nested?.query.bool.should?.length > 0 ||
                                        item.nested?.query.bool.must.bool.should.length > 0);
    const activeMultipleNested = filters.filter(item => item.bool?.should.length > 0 && item.bool.should[0]?.nested);

    // Functions to filter out active filters. These prevents doc count changes on active filters
    function filterActive(field) {
      // Open access aggregations come from 3 different aggs and need special case for filters
      if (field === 'openAccess') {
        const filteredActive = active.filter(item => Object.keys(item.bool.should[0].term)?.toString() !== 'openAccessCode' &&
                                            Object.keys(item.bool.should[0].term)?.toString() !== 'selfArchivedCode');
        return filteredActive.concat(activeNested, activeMultipleNested);
      } else {
        return active.filter(item => Object.keys(item.bool.should[0].term)?.toString() !== field)
        .concat(activeNested, activeMultipleNested, activeBool);
      }
    }

    function filterActiveNested(path) {
      return activeNested.filter(item => item.nested.path !== path).concat(active, activeMultipleNested, activeBool);
    }

    // TODO: Don't rely on path order. Use protype find instead
    function filterActiveMultipleNested(path1, path2) {
      const res = activeMultipleNested.filter(item => item.bool.should[0].nested.path !== path2)
                  .concat(activeMultipleNested.filter(item => item.bool.should[1].nested.path !== path1));
      return res.concat(active, activeNested, activeBool);
    }

    const yearAgg = {
      filter: {
        bool: {
          filter: filterActive(this.sortService.yearField)
        }
      },
      aggs: {
        years: {
          terms: {
            field: this.sortService.yearField,
            order: { _key : 'desc' },
            size: 100
          }
        }
      }
    };

    const basicAgg = (filterMethod: any, path: string, fieldName: string, orderBy: string, sizeOf: number) => {
      return {
        filter: {
          bool: {
            filter: filterMethod
          }
        },
        aggs: {
          [path]: {
            terms: {
              field: fieldName,
              ...( orderBy ? {order: { _key : orderBy }} : []),
              ...( sizeOf ? {size: sizeOf} : []),
            }
          }
        }
      };
    };

    // Aggregations
    const payLoad: any = {
      ...(searchTerm ? { query: {
        // Get query settings and perform aggregations based on tab. Nested filters use reverse nested aggregation to filter out fields
        // outside path.
        bool: { should: [ this.settingsService.querySettings(tab.slice(0, -1), searchTerm) ] }
        }} : []),
      size: 0,
      aggs: {}
    };

    const terms = (fieldName: string, orderBy: string, sizeOf: number, exclusion: any) => {
      return {
        terms: {
          field: fieldName,
          ...( orderBy ? {order: { _key : orderBy }} : []),
          ...( sizeOf ? {size: sizeOf} : []),
          ...( exclusion ? {exclude: exclusion} : []),
        }
      };
    };

    console.log(terms('author.name' + this.localeC + 'Sector.keyword', undefined, 50, ' '));

    switch (tab) {
      case 'publications':
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.organization = {
          nested: {
            path: 'author'
          },
          aggs: {
            sectorName: {
              terms: {
                size: 50,
                field: 'author.name' + this.localeC + 'Sector.keyword',
                exclude: ' '
              },
              aggs: {
                sectorId: {
                  terms: {
                    size: 50,
                    field: 'author.sectorId.keyword'
                  }
                },
                organization: {
                  terms: {
                    size: 50,
                    field: 'author.organization.OrganizationName' + this.localeC + '.keyword'
                  },
                  aggs: {
                    filtered: {
                      reverse_nested: {},
                      aggs: {
                        filterCount: {
                          filter: {
                            bool: {
                              filter: filterActiveNested('author')
                            }
                          }
                        }
                      }
                    },
                    orgId: {
                      terms: {
                        size: 1,
                        field: 'author.organization.organizationId.keyword'
                      }
                    }
                  }
                },
                org: {
                  nested: {
                    path: 'author.organization'
                  },
                  aggs: {
                    org: {
                      terms: {
                        size: 50,
                        field: 'author.organization.OrganizationName' + this.localeC + '.keyword'
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveNested('author')
                                }
                              }
                            }
                          }
                        },
                        orgId: {
                          terms: {
                            size: 10,
                            field: 'author.organization.organizationId.keyword'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.countryCode = {
          filter: {
            bool: {
              filter: filterActive('internationalPublication')
            }
          },
          aggs: {
            countryCodes: {
              terms: {
                field: 'internationalPublication',
                order: { _key : 'asc' },
                size: 50
              }
            }
          }
        };
        payLoad.aggs.lang = {
          filter: {
            bool: {
              filter: filterActive('languages.languageCode')
            }
          },
          aggs: {
            langs: {
              terms: {
                field: 'languages.languageCode.keyword',
                size: 50
              },
              aggs: {
                language: {
                  terms: {
                    field: 'languages.' + this.langByLocale(this.localeId) + '.keyword',
                    size: 100
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.publicationType = {
          filter: {
            bool: {
              filter: filterActive('publicationTypeCode.keyword')
            }
          },
          aggs: {
            publicationTypes: {
              terms: {
                field: 'publicationTypeCode.keyword',
                size: 50,
                exclude: ' ',
                order: {
                  _key: 'asc'
                }
              }
            }
          }
        };
        payLoad.aggs.juFo = {
          filter: {
            bool: {
              filter: filterActive('jufoClassCode.keyword')
            }
          },
          aggs: {
            juFoCodes: {
              terms: {
                field: 'jufoClassCode.keyword',
                order: {
                  _key: 'desc'
                }
              }
            }
          }
        };
        payLoad.aggs.internationalCollaboration = {
          filter: {
            bool: {
              filter: filterActive('internationalCollaboration')
            }
          },
          aggs: {
            internationalCollaborationCodes: {
              terms: {
                field: 'internationalCollaboration',
                size: 2,
              }
            }
          }
        };
        // Field of science
        payLoad.aggs.field = {
          nested: {
            path: 'fieldsOfScience'
          },
          aggs: {
            fields: {
              terms: {
                field: 'fieldsOfScience.name' + this.localeC + 'Science.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience')
                        }
                      }
                    }
                  }
                },
                fieldId: {
                  terms: {
                    field: 'fieldsOfScience.fieldIdScience'
                  }
                }
              }
            }
          }
        };
        // Open access
        payLoad.aggs.selfArchived = {
          filter: {
            bool: {
              filter: filterActive('openAccess')
            }
          },
          aggs: {
            selfArchivedCodes: {
              terms: {
                field: 'selfArchivedCode'
              }
            }
          }
        };
        payLoad.aggs.openAccess = {
          filter: {
            bool: {
              filter: filterActive('openAccess')
            }
          },
          aggs: {
            openAccessCodes: {
              terms: {
                field: 'openAccessCode'
              }
            }
          }
        };
        // Composite is to get aggregation of selfarchived and open access codes of 0
        payLoad.aggs.oaComposite = {
          composite: {
            sources: [
              {
                selfArchived: {
                  terms: {
                    field: 'selfArchivedCode'
                  }
                }
              },
              {
                openAccess: {
                  terms: {
                    field: 'openAccessCode'
                  }
                }
              }
            ]
          },
          aggs: {
            filtered: {
              filter: {
                bool: {
                  filter: filterActive('openAccess')
                }
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
              filter: filterActive('funderNameFi.keyword')
            }
          },
          aggs: {
            funders: {
              terms: {
                field: 'funderNameFi.keyword',
                size: 250,
                order: {
                  _key: 'asc'
                }
              }
            }
          }
        };
        // Sector & organization
        payLoad.aggs.organization = {
          nested: {
            path: 'fundingGroupPerson'
          },
          aggs: {
            funded: {
              filter: {
                terms: {
                  'fundingGroupPerson.fundedPerson': [
                    1
                  ]
                }
              },
              aggs: {
                sectorName: {
                  terms: {
                    size: 50,
                    field: 'fundingGroupPerson.fundedPersonOrganizationName' + this.localeC + '.keyword',
                    exclude: ' |Rahoittaja'
                  },
                  aggs: {
                    sectorId: {
                      terms: {
                        size: 50,
                        field: 'fundingGroupPerson.consortiumSectorId.keyword'
                      }
                    },
                    organizations: {
                      terms: {
                        size: 50,
                        field: 'fundingGroupPerson.consortiumOrganizationName' + this.localeC + '.keyword'
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveMultipleNested('fundingGroupPerson', 'organizationConsortium')
                                }
                              }
                            }
                          }
                        },
                        orgId: {
                          terms: {
                            size: 1,
                            field: 'fundingGroupPerson.consortiumOrganizationId.keyword'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.organizationConsortium = {
          nested: {
            path: 'organizationConsortium'
          },
          aggs: {
            funded: {
              filter: {
                terms: {
                  'organizationConsortium.isFinnishOrganization': [1]
                }
              },
              aggs: {
                sectorName: {
                  terms: {
                    size: 50,
                    field: 'organizationConsortium.consortiumSectorName' + this.localeC + '.keyword',
                    exclude: ' |Rahoittaja'
                  },
                  aggs: {
                    sectorId: {
                      terms: {
                        size: 50,
                        field: 'organizationConsortium.consortiumSectorId.keyword'
                      }
                    },
                    organizations: {
                      terms: {
                        size: 50,
                        field: 'organizationConsortium.consortiumOrganizationName' + this.localeC + '.keyword'
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveMultipleNested('fundingGroupPerson', 'organizationConsortium')
                                }
                              }
                            }
                          }
                        },
                        orgId: {
                          terms: {
                            size: 1,
                            field: 'organizationConsortium.consortiumOrganizationId.keyword'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        // Type of funding
        payLoad.aggs.typeOfFunding = {
          filter: {
            bool: {
              filter: filterActive('typeOfFundingId.keyword')
            }
          },
          aggs: {
            types: {
              terms: {
                field: 'typeOfFunding.typeOfFundingHeaderId.keyword',
                exclude: ' '
              },
              aggs: {
                headerFi: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameFi.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc'
                    }
                  },
                  aggs: {
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    }
                  }
                },
                headerEn: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameEn.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc'
                    }
                  },
                  aggs: {
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    }
                  }
                },
                headerSv: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameSv.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc'
                    }
                  },
                  aggs: {
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        // Field of science

        payLoad.aggs.field = {
          nested: {
            path: 'fieldsOfScience'
          },
          aggs: {
            fields: {
              terms: {
                field: 'fieldsOfScience.name' + this.localeC + 'Science.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience')
                        }
                      }
                    }
                  }
                },
                fieldId: {
                  terms: {
                    field: 'fieldsOfScience.fieldIdScience.keyword'
                  }
                }
              }
            }
          }
        };

        // payLoad.aggs.field = {
        //   filter: {
        //     bool: {
        //       filter: filterActive('fields_of_science.fieldIdScience')
        //     }
        //   },
        //   aggs: {
        //     fields: {
        //       terms: {
        //         field: 'fields_of_science.name' + this.localeC + 'Science.keyword',
        //         exclude: ' ',
        //         size: 250,
        //         order: {
        //           _key: 'asc'
        //         }
        //       },
        //       aggs: {
        //         fieldId: {
        //           terms: {
        //             field: 'fields_of_science.fieldIdScience.keyword',
        //             size: 1
        //           }
        //         }
        //       }
        //     }
        //   }
        // };
        // Funding status
        payLoad.aggs.fundingStatus = {
          filter: {
            bool: {
              filter: filterActive('fundingEndDate')
            }
          },
          aggs: {
            status: {
              range: {
                field: 'fundingEndDate',
                ranges: [
                  {
                    from: this.today
                  }
                ]
              }
            }
          }
        };
        // Scheme & Keywords
        payLoad.aggs.scheme = {
          filter: {
            bool: {
              filter: filterActive('keywords.scheme.keyword')
            }
          },
          aggs: {
            types: {
              terms: {
                field: 'keywords.scheme.keyword',
                size: 10,
              },
              aggs: {
                typeName: {
                  terms: {
                    field: 'keywords.keyword.keyword' + this.localeC + '.keyword',
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.faField = {
          filter: {
            bool: {
              filter: filterActive('keywords.keyword.keyword')
            }
          },
          aggs: {
            faFields: {
              terms: {
                field: 'keywords.keyword.keyword',
                size: 50,
                exclude: ' '
              }
            }
          }
        };
        break;
      // Infrastructures
      case 'infrastructures': {
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.type = basicAgg(filterActive('services.serviceType.keyword'), 'types', 'services.serviceType.keyword', null, null);
        payLoad.aggs.organization = {
          filter: {
            bool: {
              filter: filterActive('responsibleOrganization.TKOppilaitosTunnus.keyword')
            }
          },
          aggs: {
            sector: {
              terms: {
                field: 'responsibleOrganization.responsibleOrganizationSector' + this.localeC + '.keyword',
                exclude: ' '
              },
              aggs: {
                organizations: {
                  terms: {
                    field: 'responsibleOrganization.responsibleOrganizationName' + this.localeC + '.keyword',
                    exclude: ' '
                  },
                  aggs: {
                    organizationId: {
                      terms: {
                        field: 'responsibleOrganization.TKOppilaitosTunnus.keyword',
                        exclude: ' '
                      }
                    }
                  }
                },
                sectorId: {
                  terms: {
                    field: 'responsibleOrganization.responsibleOrganizationSectorId.keyword'
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.infraField = {
          nested: {
            path: 'fieldsOfScience'
          },
          aggs: {
            infraFields: {
              terms: {
                field: 'fieldsOfScience.name' + this.localeC + '.keyword'
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience')
                        }
                      }
                    }
                  }
                },
                majorId: {
                  terms: {
                    field: 'fieldsOfScience.field_id.keyword'
                  }
                }
              }
            }
          }
        };
        break;
      }
      // Organizations
      case 'organizations':
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.sector = {
          filter: {
            bool: {
              filter: filterActive('sectorId.keyword')
            }
          },
          aggs: {
            sectorId: {
              terms: {
                field: 'sectorId.keyword',
                size: 50,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                sectorName: {
                  terms: {
                    field: 'sectorName' + this.localeC + '.keyword',
                  }
                }
              }
            }
          }
        };
        break;
      // News
      case 'news':
        payLoad.aggs.organization = {
          terms: {
            field: 'sectorId.keyword'
          },
          aggs: {
            sectorName: {
              terms: {
                field: 'sectorName' + this.localeC + '.keyword'
              }
            },
            orgName: {
              terms: {
                field: 'organizationName' + this.localeC + '.keyword'
              },
              aggs: {
                orgId: {
                  terms: {
                    field: 'organizationId.keyword'
                  }
                }
              }
            }
          }
        };
        break;
      default:
        break;
    }
    return payLoad;
  }
}
