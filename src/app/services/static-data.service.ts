//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { VisualQuery } from '../models/visualisation/visualisations.model';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {
  // Filters, Fields of study
  majorFieldsOfScience = [
    {id: 1, key: $localize`:@@naturalSciences:Luonnontieteet`, checked: false, subData: [], doc_count: 0},
    {id: 2, key: $localize`:@@engineeringTecnology:Tekniikka`, checked: false, subData: [], doc_count: 0},
    {id: 3, key: $localize`:@@medicalHealthSciences:Lääke- ja terveystieteet`, checked: false, subData: [], doc_count: 0},
    {id: 4, key: $localize`:@@agriculturalSciences:Maatalous- ja metsätieteet`, checked: false, subData: [], doc_count: 0},
    {id: 5, key: $localize`:@@socialSciences:Yhteiskuntatieteet`, checked: false, subData: [], doc_count: 0},
    {id: 6, key: $localize`:@@humanities:Humanistiset tieteet`, checked: false, subData: [], doc_count: 0},
    {id: 9, key: $localize`:@@otherSciences:Muut tieteet`, checked: false, subData: [], doc_count: 0}
  ];

  // Filters, Publication class
  publicationClass = [
    {id: 1, class: 'A', label: $localize`Vertaisarvioidut tieteelliset artikkelit`, types: [
      {type: 'A1', label: $localize`Alkuperäisartikkeli tieteellisessä aikakauslehdessä`, key: '', doc_count: 0},
      {type: 'A2', label: $localize`Katsausartikkeli tieteellisessä aikakauslehdessä`, key: '', doc_count: 0},
      {type: 'A3', label: $localize`Kirjan tai muun kokoomateoksen osa`, key: '', doc_count: 0},
      {type: 'A4', label: $localize`Artikkeli konferenssijulkaisussa`, key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 2, class: 'B', label: $localize`Vertaisarvioimattomat tieteelliset kirjoitukset`, types: [
      {type: 'B1', label: $localize`Kirjoitus tieteellisessä aikakauslehdessä`, key: '', doc_count: 0},
      {type: 'B2', label: $localize`Kirjan tai muun kokoomateoksen osa`, key: '', doc_count: 0},
      {type: 'B3', label: $localize`Vertaisarvioimaton artikkeli konferenssijulkaisussa`, key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 3, class: 'C', label: $localize`Tieteelliset kirjat (monografiat)`, types: [
      {type: 'C1', label: $localize`Kustannettu tieteellinen erillisteos`, key: '', doc_count: 0},
      {type: 'C2', label: $localize`Toimitettu kirja, kokoomateos, konferenssijulkaisu tai lehden erikoisnumero`, key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 4, class: 'D', label: $localize`Ammattiyhteisölle suunnatut julkaisut`, types: [
      {type: 'D1', label: $localize`Artikkeli ammattilehdessä`, key: '', doc_count: 0},
      {type: 'D2', label: $localize`Artikkeli ammatillisessa käsi- tai opaskirjassa, ammatillisessa tietojärjestelmässä tai oppikirja-aineisto`, key: '', doc_count: 0},
      {type: 'D3', label: $localize`Artikkeli ammatillisessa konferenssijulkaisussa`, key: '', doc_count: 0},
      {type: 'D4', label: $localize`Julkaistu kehittämis- tai tutkimusraportti taikka -selvitys`, key: '', doc_count: 0},
      {type: 'D5', label: $localize`Oppikirja, ammatillinen käsi- tai opaskirja taikka sanakirja`, key: '', doc_count: 0},
      {type: 'D6', label: $localize`Toimitettu ammatillinen teos`, key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 5, class: 'E', label: $localize`Suurelle yleisölle suunnatut julkaisut`, types: [
      {type: 'E1', label: $localize`Yleistajuinen artikkeli, sanomalehtiartikkeli`, key: '', doc_count: 0},
      {type: 'E2', label: $localize`Yleistajuinen monografia`, key: '', doc_count: 0},
      {type: 'E3', label: $localize`Toimitettu yleistajuinen teos`, key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 6, class: 'F', label: $localize`Julkinen taiteellinen ja taideteollinen toiminta`, types: [
      {type: 'F1', label: $localize`Erillisjulkaisu`, key: '', doc_count: 0},
      {type: 'F2', label: $localize`Julkinen taiteellinen teoksen osatoteutus`, key: '', doc_count: 0},
      {type: 'F3', label: $localize`Ei-taiteellisen julkaisun taiteellinen osa`, key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 7, class: 'G', label: $localize`Opinnäytteet`, types: [
      {type: 'G4', label: $localize`Monografiaväitöskirja`, key: '', doc_count: 0},
      {type: 'G5', label: $localize`Artikkeliväitöskirja`, key: '', doc_count: 0}
    ]}
  ];

  juFoCode = [
    {key: '3', label: $localize`Korkein taso`},
    {key: '2', label: $localize`Johtava taso`},
    {key: '1', label: $localize`Perustaso`},
    {key: '0', label: $localize`:@@other:Muut`},
    {key: ' ', label: $localize`:@@noRating:Ei arviota`},
  ];

  // Query parameters
  minScore = 10;

  httpErrors = {
    400: $localize`HTTP pyyntöä ei voitu käsitellä`,
    401: $localize`Pyyntö vaatii sen käsittelyyn oikeutetut tunnukset`,
    403: $localize`Ei oikeutta käsitellä pyyntöä`,
    404: $localize`Haluttua tietoa ei ole olemassa`,
    405: $localize`:@@forbiddenRequest:Pyyntömetodi ei ole sallittu`,
    500: $localize`Palvelinvirhe. Palvelimella tapahtui virhe pyyntöä käsitellessä`
  };

  constructor() { }

  // Query fields where exact match isn't needed
  queryFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = ['publicationName^2', 'publicationYear', 'authorsText',
              'journalName', 'conferenceName', 'parentPublicationName', 'parentPublicationPublisher',
              'publisherName', 'publisherLocation', 'doi', 'doiHandle', 'greenOpenAccessAddress',  'fields_of_education',
              'issn', 'issn2', 'isbn', 'isbn2', 'keywords.keyword',
              'jufoCode', 'jufoClassCode', 'fields_of_science.nameFiScience', 'fields_of_science.nameEnScience',
              'fields_of_science.nameSvScience',];
        break;
      }
      case 'person': {
        res = ['firstName', 'lastName'];
        break;
      }
      case 'funding': {
        res = ['projectNameFi^2', 'projectNameEn^2', 'projectNameSv^2', 'projectAcronym', 'projectDescriptionFi', 'projectDescriptionEn',
        'projectDescriptionSv', 'fundingStartYear', 'fundingContactPersonLastName', 'fundingContactPersonFirstNames',
        'funderNameFi', 'funderNameEn', 'funderNameSv', 'funderNameUnd', '' , 'typeOfFundingId', 'typeOfFundingNameFi',
        'typeOfFundingNameEn', 'typeOfFundingNameSv', 'callProgrammeNameFi', 'callProgrammeNameEn', 'callProgrammeNameSv',
        'callProgrammeHomepage', 'callProgrammeUnd', 'funderProjectNumber', 'keywords.keyword', 'keyword.scheme',
        'fundedNameFi', 'funderNameFi'];
        break;
      }
      case 'infrastructure': {
        res = ['nameFi^2', 'nameEn^2', 'nameSv^2', 'descriptionFi', 'descriptionEn', 'descriptionSv',
        'scientificDescription', 'startYear', 'acronym', 'responsibleOrganizationNameFi', 'responsibleOrganizationNameEn',
        'responsibleOrganizationNameSv', 'keywords.keyword', 'services.serviceName', 'services.serviceDescription',
        'services.serviceType', 'services.servicePointName', 'services.serviceAcronym', 'services.servicePointEmailAddress',
        'services.servicePointInfoUrl', 'services.servicePointPhoneNumber', 'services.servicePointVisitingAddress'];
        break;
      }
      case 'organization': {
        res = ['nameFi^2', 'nameEn^2', 'nameSv^2', 'variantNames', 'organizationBackground', 'predecessors.nameFi', 'related', 'homepage',
        'visitingAddress', 'businessId', 'subUnits'];
        break;
      }
    }
    return res;
  }

  nestedQueryFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = [
          'author.nameFiSector',
          'author.organization.OrganizationNameFi',
          'author.organization.OrganizationNameEn',
          'author.organization.OrganizationNameSv',
          'author.organization.organizationUnit.organizationUnitNameFi',
          'author.organization.organizationUnit.organizationUnitNameEn',
          'author.organization.organizationUnit.organizationUnitNameSv',
          'author.organization.organizationUnit.person.authorFirstNames',
          'author.organization.organizationUnit.person.authorLastName',
          'author.organization.organizationUnit.person.Orcid'
        ];
        break;
      }
      case 'funding': {
        res = [
          'organizationConsortium.consortiumOrganizationNameFi',
          'organizationConsortium.consortiumOrganizationNameEn',
          'organizationConsortium.consortiumOrganizationNameSv',
          'organizationConsortium.roleInConsortium',
          'fundingGroupPerson.fundingGroupPersonFirstNames',
          'fundingGroupPerson.fundingGroupPersonLastName',
          'fundingGroupPerson.consortiumOrganizationBusinessId',
          'fundingGroupPerson.consortiumOrganizationNameFi',
          'fundingGroupPerson.consortiumOrganizationNameEn',
          'fundingGroupPerson.consortiumOrganizationNameSv',
          'fundingGroupPerson.roleInFundingGroup',
          'fundingGroupPerson.consortiumProject'
        ]
      }
    }
    return res;
  }

  targetFields(target, index) {
    let res = [];
    switch (target) {
      case 'name': {
        switch (index) {
          case 'publication': {
            res = ['authorsText'];
            break;
          }
          case 'funding': {
            res = ['fundingContactPersonLastName', 'fundingContactPersonFirstNames'];
            break;
          }
          case 'infrastructure': {
            res = [''];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
      case 'title': {
        switch (index) {
          case 'publication': {
            res = ['publicationName'];
            break;
          }
          case 'funding': {
            res = ['projectNameFi', 'projectNameSv', 'projectNameEn', 'projectAcronym'];
            break;
          }
          case 'infrastructure': {
            res = ['nameFi', 'nameSv', 'nameEn', 'acronym', 'services.serviceName', 'services.serviceAcronym'];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
      case 'keywords': {
        switch (index) {
          case 'publication': {
            res = ['keywords.keyword'];
            break;
          }
          case 'funding': {
            res = ['keywords.keyword'];
            break;
          }
          case 'infrastructure': {
            res = ['keywords.keyword'];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
      case 'organization': {
        switch (index) {
          case 'publication': {
            res = [''];
            break;
          }
          case 'funding': {
            res = [''];
            break;
          }
          case 'infrastructure': {
            res = ['responsibleOrganizationNameFi', 'responsibleOrganizationNameEn', 'responsibleOrganizationNameSv'];
            break;
          }
          case 'organization': {
            res = ['nameFi', 'nameEn', 'nameSv', 'variantNames'];
            break;
          }
        }
        break;
      }
      case 'funder': {
        switch (index) {
          case 'publication': {
            res = [''];
            break;
          }
          case 'funding': {
            res = ['funderNameFi', 'funderNameEn', 'funderNameSv', 'funderNameUnd'];
            break;
          }
          case 'infrastructure': {
            res = [''];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
    }

    return res;
  }

  targetNestedQueryFields(target, index) {
    let res = [];
    switch (target) {
      case 'name': {
        switch (index) {
          case 'publication': {
            res = [
              'author.organization.organizationUnit.person.authorFirstNames',
              'author.organization.organizationUnit.person.authorLastName',
              'author.organization.organizationUnit.person.Orcid'
            ];
            break;
          }
          case 'funding': {
            res = [
              'fundingGroupPerson.fundingGroupPersonFirstNames',
              'fundingGroupPerson.fundingGroupPersonLastName'
            ];
            break;
          }
        }
        break;
      }
      case 'organization': {
        switch (index) {
          case 'publication': {
            res = [
              'author.organization.OrganizationNameFi',
              'author.organization.OrganizationNameEn',
              'author.organization.OrganizationNameSv'
            ];
            break;
          }
          case 'funding': {
            res = [
              'organizationConsortium.consortiumOrganizationNameFi',
              'organizationConsortium.consortiumOrganizationNameEn',
              'organizationConsortium.consortiumOrganizationNameSv',
              'fundingGroupPerson.consortiumOrganizationNameFi',
              'fundingGroupPerson.consortiumOrganizationNameEn',
              'fundingGroupPerson.consortiumOrganizationNameSv'
            ];
            break;
          }
        }
        break;
      }
    }
    return res;
  }

  visualisationData: {locale: d3.FormatLocaleDefinition, publication: VisualQuery[], funding: VisualQuery[]} = {
    locale: {
      decimal: '.',
      thousands: ' ',
      grouping: [3],
      currency: ['', '€'],
    },
    publication: [
        {
            field: 'year',
            title: 'Julkaisujen määrä vuosittain',
            select: $localize`:@@yearOfPublication:Julkaisuvuosi`,
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 1,
                    order: 0
                }
            ]
        },
        {
            field: 'fieldOfScience',
            title: 'Julkaisujen määrä tieteenaloittain',
            select: $localize`:@@fieldOfScience:Tieteenala`,
            message: 'Huom. Yhdellä julkaisulla voi olla useita tieteenaloja. Julkaisu sisältyy tällöin jokaisen siihen liitetyn tieteenalan lukumäärään.',
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'fields_of_science.name|locale|Science.keyword',
                    name: 'fieldsOfScience',
                    size: 100,
                    order: 1,
                    filterName: 'field',
                    exclude: [' ']
                }
            ]
        },
        {
            field: 'majorFieldOfScience',
            title: 'Julkaisujen määrä päätieteenaloittain',
            select: $localize`:@@mainFieldOfScience:Päätieteenala`,
            message: 'Huom. Yhdellä julkaisulla voi olla useita tieteenaloja. Julkaisu sisältyy tällöin jokaisen siihen liitetyn tieteenalan lukumäärään.',
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'fields_of_science.name|locale|Science.keyword',
                    name: 'majorFieldOfScience',
                    size: 100,
                    order: 1,
                    filterName: 'field',
                    exclude: [' ']
                },
                {
                    field: 'fields_of_science.fieldIdScience',
                    name: 'fieldId',
                    size: 1,
                    order: 0,
                    exclude: [0]
                }
            ]
        },
        {
            field: 'organization',
            title: 'Julkaisujen määrä organisaatioittain',
            select: $localize`:@@organization:Organisaatio`,
            message: 'Huom. Yhdellä julkaisulla voi olla useita organisaatioita. Julkaisu sisältyy tällöin jokaisen siihen liitetyn organisaation lukumäärään',
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    name: 'orgNested',
                    nested: 'author'
                },
                {
                    field: 'author.organization.organizationId.keyword',
                    name: 'organizationId',
                    size: 100,
                    order: 2,
                    filterName: 'organization'
                },
                {
                    field: 'author.organization.OrganizationName|locale|.keyword',
                    name: 'organizationName',
                    size: 1,
                    order: 0
                }
            ]
        },
        {
            field: 'publicationType',
            title: 'Julkaisujen määrä julkaisutyypin mukaan',
            select: $localize`:@@publicationType:Julkaisutyyppi`,
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'publicationTypeCode.keyword',
                    name: 'publicationType',
                    size: 100,
                    order: 1,
                    filterName: 'publicationType',
                    exclude: [' ']
                }
            ]
        },
        {
            field: 'country',
            title: 'Julkaisujen määrä julkaisumaan mukaan',
            select: $localize`:@@publicationCountry:Julkaisumaa`,
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'internationalPublication',
                    name: 'country',
                    size: 2,
                    order: 1
                }
            ]
        },
        {
            field: 'lang',
            title: 'Julkaisujen määrä kielen mukaan',
            select: $localize`:@@language:Kieli`,
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'languages.languageCode.keyword',
                    name: 'lang',
                    size: 50,
                    order: 2,
                    exclude: [' ']
                },
                {
                    field: 'languages.language|locale|.keyword',
                    name: 'language',
                    size: 50,
                    order: 0
                }
            ]
        },
        {
            field: 'juFo',
            title: 'Julkaisujen määrä julkaisufoorumitason mukaan',
            select: $localize`:@@jufoLevel:Julkaisufoorumitaso`,
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'jufoClassCode.keyword',
                    name: 'juFo',
                    size: 5,
                    order: 2,
                    exclude: [' ']
                }
            ]
        },
        {
            field: 'openAccess',
            title: 'Julkaisujen määrä avoimen saatavuuden mukaan',
            select: $localize`:@@openAccess:Avoin saatavuus`,
            hierarchy: [
                {
                    field: 'publicationYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    script: 'doc["openAccessCode"].value * 10 + doc["selfArchivedCode"].value',
                    name: 'openAccess',
                    size: 50,
                    order: 2
                }
            ]
        }
    ],
    funding: [
        {
            field: 'year',
            title: 'Hankkeiden määrä vuosittain',
            select: $localize`:@@startYear:Aloitusvuosi`,
            hierarchy: [
                {
                    field: 'fundingStartYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'fundingStartYear',
                    name: 'year',
                    size: 1,
                    order: 0
                }
            ]
        },
        // Removed due to incorrect functionality
        // {
        //     field: 'amount',
        //     title: 'Myönnetty summa vuosittain',
        //     select: $localize`:@@fundingGranted:Myönnetty rahoitus`,
        //     hierarchy: [
        //         {
        //             field: 'fundingStartYear',
        //             name: 'year',
        //             size: 10,
        //             order: 1
        //         },
        //         {
        //             field: 'amount_in_EUR',
        //             name: 'amount',
        //             size: 1000,
        //             order: 0
        //         }
        //     ]
        // },
        {
            field: 'funder',
            title: 'Hankkeiden määrä rahoittajan mukaan',
            select: $localize`:@@fundingFunder:Rahoittaja`,
            hierarchy: [
                {
                    field: 'fundingStartYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'funderNameFi.keyword',
                    name: 'funder',
                    size: 100,
                    order: 1
                }
            ]
        },
        {        
            field: 'organization',
            title: 'Hankkeiden määrä organisaatioittain',
            select: $localize`:@@organization:Organisaatio`,
            message: 'Huom. Yhdellä hankkeella voi olla useita organisaatioita. Hanke sisältyy tällöin jokaisen siihen liitetyn organisaation lukumäärään',
            hierarchy: [
                {
                    field: 'fundingStartYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    name: 'orgNested',
                    nested: 'fundingGroupPerson'
                },
                {
                    name: 'fundedPerson',
                    filter: {
                        field: 'fundingGroupPerson.fundedPerson',
                        value: [1]
                    }
                },
                {
                    field: 'fundingGroupPerson.fundedPersonOrganizationName|locale|.keyword',
                    name: 'sectorName',
                    size: 10,
                    order: 2,
                    exclude: ' |Rahoittaja'
                },
                {
                    field: 'fundingGroupPerson.consortiumOrganizationId.keyword',
                    name: 'organizationId',
                    size: 100,
                    order: 2,
                    filterName: 'organization'
                },
                {
                    field: 'fundingGroupPerson.consortiumOrganizationName|locale|.keyword',
                    name: 'organizationName',
                    size: 1,
                    order: 0
                }
            ],
            hierarchy2: [
                {
                    field: 'fundingStartYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    name: 'orgNested',
                    nested: 'organizationConsortium'
                },
                {
                    name: 'finnishOrganization',
                    filter: {
                        field: 'organizationConsortium.isFinnishOrganization',
                        value: [1]
                    }
                },
                {
                    field: 'organizationConsortium.consortiumSectorName|locale|.keyword',
                    name: 'sectorName',
                    size: 10,
                    order: 2,
                    exclude: ' |Rahoittaja'
                },
                {
                    field: 'organizationConsortium.consortiumOrganizationId.keyword',
                    name: 'organizationId',
                    size: 100,
                    order: 2,
                    filterName: 'organization'
                },
                {
                    field: 'organizationConsortium.consortiumOrganizationName|locale|.keyword',
                    name: 'organizationName',
                    size: 1,
                    order: 0
                }
            ]
        },
        {
            field: 'typeOfFunding',
            title: 'Hankkeiden määrä rahoitusmuodon mukaan',
            select: $localize`:@@typeOfFunding:Rahoitusmuoto`,
            message: 'Huom. Hankkeita, joille ei ole määritelty rahoitusmuotoa, ei lasketa mukaan kuavaajaan.',
            hierarchy: [
                {
                    field: 'fundingStartYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'typeOfFundingId.keyword',
                    name: 'typeId',
                    size: 100,
                    exclude: ' *',
                    order: 1
                },
                {
                    script: 'doc["typeOfFundingName|locale|.keyword"].value + "|" + doc["typeOfFundingNameEn.keyword"].value + "|" + doc["typeOfFundingNameFi.keyword"].value',
                    name: 'typeName',
                    size: 1,
                    order: 0
                }
            ]
        },
        {
            field: 'fieldOfScience',
            title: 'Hankkeiden määrä tieteenaloittain',
            select: $localize`:@@fieldOfScience:Tieteenala`,
            message: 'Huom. Yhdellä hankkeella voi olla useita tieteenaloja. Hanke sisältyy tällöin jokaisen siihen liitetyn tieteenalan lukumäärään. Hankkeita, joille ei ole määritelty tieteenalaa, ei lasketa mukaan kuvaajaan.',
            hierarchy: [
                {
                    field: 'fundingStartYear',
                    name: 'year',
                    size: 10,
                    order: 1
                },
                {
                    field: 'fields_of_science.name|locale|Science.keyword',
                    name: 'fieldsOfScience',
                    size: 100,
                    order: 1,
                    filterName: 'field',
                    exclude: [' ']
                }
            ]
        }
    ]
}
}
